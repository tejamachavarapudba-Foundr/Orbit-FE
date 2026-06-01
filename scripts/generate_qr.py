from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image


GF_EXP = [0] * 512
GF_LOG = [0] * 256


def init_gf() -> None:
    value = 1
    for index in range(255):
        GF_EXP[index] = value
        GF_LOG[value] = index
        value <<= 1
        if value & 0x100:
            value ^= 0x11D
    for index in range(255, 512):
        GF_EXP[index] = GF_EXP[index - 255]


def gf_mul(left: int, right: int) -> int:
    if left == 0 or right == 0:
        return 0
    return GF_EXP[GF_LOG[left] + GF_LOG[right]]


def poly_mul(left: list[int], right: list[int]) -> list[int]:
    result = [0] * (len(left) + len(right) - 1)
    for left_index, left_value in enumerate(left):
        for right_index, right_value in enumerate(right):
            result[left_index + right_index] ^= gf_mul(left_value, right_value)
    return result


def rs_generator(degree: int) -> list[int]:
    result = [1]
    for index in range(degree):
        result = poly_mul(result, [1, GF_EXP[index]])
    return result


def rs_ecc(data: list[int], degree: int) -> list[int]:
    generator = rs_generator(degree)
    result = data[:] + [0] * degree
    for index, value in enumerate(data):
        factor = result[index]
        if factor == 0:
            continue
        for generator_index, generator_value in enumerate(generator):
            result[index + generator_index] ^= gf_mul(generator_value, factor)
    return result[-degree:]


class BitBuffer:
    def __init__(self) -> None:
        self.bits: list[int] = []

    def append(self, value: int, length: int) -> None:
        for shift in range(length - 1, -1, -1):
            self.bits.append((value >> shift) & 1)

    def to_codewords(self) -> list[int]:
        return [
            int("".join(str(bit) for bit in self.bits[index : index + 8]), 2)
            for index in range(0, len(self.bits), 8)
        ]


def make_data_codewords(text: str) -> list[int]:
    data_capacity = 34
    payload = text.encode("utf-8")
    if len(payload) > 32:
        raise ValueError("This compact QR generator supports up to 32 bytes.")

    buffer = BitBuffer()
    buffer.append(0b0100, 4)
    buffer.append(len(payload), 8)
    for byte in payload:
        buffer.append(byte, 8)

    remaining = data_capacity * 8 - len(buffer.bits)
    buffer.append(0, min(4, remaining))
    while len(buffer.bits) % 8:
        buffer.append(0, 1)

    codewords = buffer.to_codewords()
    pads = [0xEC, 0x11]
    pad_index = 0
    while len(codewords) < data_capacity:
        codewords.append(pads[pad_index % 2])
        pad_index += 1
    return codewords


def add_finder(matrix: list[list[int | None]], reserved: list[list[bool]], row: int, col: int) -> None:
    size = len(matrix)
    for y in range(row - 1, row + 8):
        for x in range(col - 1, col + 8):
            if 0 <= y < size and 0 <= x < size:
                reserved[y][x] = True
                matrix[y][x] = 0
    for y in range(7):
        for x in range(7):
            value = 1 if x in (0, 6) or y in (0, 6) or (2 <= x <= 4 and 2 <= y <= 4) else 0
            matrix[row + y][col + x] = value


def reserve(matrix: list[list[int | None]], reserved: list[list[bool]], row: int, col: int, value: int) -> None:
    matrix[row][col] = value
    reserved[row][col] = True


def add_patterns(matrix: list[list[int | None]], reserved: list[list[bool]]) -> None:
    size = len(matrix)
    add_finder(matrix, reserved, 0, 0)
    add_finder(matrix, reserved, 0, size - 7)
    add_finder(matrix, reserved, size - 7, 0)

    for index in range(8, size - 8):
        value = 1 if index % 2 == 0 else 0
        reserve(matrix, reserved, 6, index, value)
        reserve(matrix, reserved, index, 6, value)

    center = 18
    for y in range(center - 2, center + 3):
        for x in range(center - 2, center + 3):
            value = 1 if abs(y - center) == 2 or abs(x - center) == 2 or (y == center and x == center) else 0
            reserve(matrix, reserved, y, x, value)

    reserve(matrix, reserved, 17, 8, 1)

    for index in range(9):
        reserved[8][index] = True
        reserved[index][8] = True
        reserved[8][size - 1 - index] = True
        reserved[size - 1 - index][8] = True


def mask_bit(mask: int, row: int, col: int) -> bool:
    if mask == 0:
        return (row + col) % 2 == 0
    if mask == 1:
        return row % 2 == 0
    if mask == 2:
        return col % 3 == 0
    return (row + col) % 3 == 0


def place_data(matrix: list[list[int | None]], reserved: list[list[bool]], bits: list[int], mask: int) -> None:
    size = len(matrix)
    index = 0
    upward = True
    col = size - 1
    while col > 0:
        if col == 6:
            col -= 1
        rows = range(size - 1, -1, -1) if upward else range(size)
        for row in rows:
            for current_col in (col, col - 1):
                if reserved[row][current_col]:
                    continue
                bit = bits[index] if index < len(bits) else 0
                if mask_bit(mask, row, current_col):
                    bit ^= 1
                matrix[row][current_col] = bit
                index += 1
        upward = not upward
        col -= 2


def format_bits(mask: int) -> int:
    value = (0b01 << 3) | mask
    bits = value << 10
    generator = 0x537
    for shift in range(14, 9, -1):
        if (bits >> shift) & 1:
            bits ^= generator << (shift - 10)
    return ((value << 10) | bits) ^ 0x5412


def add_format(matrix: list[list[int | None]], mask: int) -> None:
    size = len(matrix)
    bits = format_bits(mask)
    first = [(8, 0), (8, 1), (8, 2), (8, 3), (8, 4), (8, 5), (8, 7), (8, 8), (7, 8), (5, 8), (4, 8), (3, 8), (2, 8), (1, 8), (0, 8)]
    second = [(size - 1, 8), (size - 2, 8), (size - 3, 8), (size - 4, 8), (size - 5, 8), (size - 6, 8), (size - 7, 8), (8, size - 8), (8, size - 7), (8, size - 6), (8, size - 5), (8, size - 4), (8, size - 3), (8, size - 2), (8, size - 1)]
    for index, (row, col) in enumerate(first):
        matrix[row][col] = (bits >> index) & 1
    for index, (row, col) in enumerate(second):
        matrix[row][col] = (bits >> index) & 1


def make_qr(text: str) -> list[list[int]]:
    init_gf()
    size = 25
    mask = 0
    matrix: list[list[int | None]] = [[None] * size for _ in range(size)]
    reserved = [[False] * size for _ in range(size)]
    add_patterns(matrix, reserved)
    data = make_data_codewords(text)
    codewords = data + rs_ecc(data, 10)
    bits = [(byte >> shift) & 1 for byte in codewords for shift in range(7, -1, -1)]
    place_data(matrix, reserved, bits, mask)
    add_format(matrix, mask)
    return [[cell or 0 for cell in row] for row in matrix]


def render(matrix: list[list[int]], output: Path) -> None:
    scale = 12
    quiet = 4
    size = len(matrix)
    image_size = (size + quiet * 2) * scale
    image = Image.new("RGB", (image_size, image_size), "white")
    pixels = image.load()
    for row in range(size):
        for col in range(size):
            if matrix[row][col] != 1:
                continue
            for y in range((row + quiet) * scale, (row + quiet + 1) * scale):
                for x in range((col + quiet) * scale, (col + quiet + 1) * scale):
                    pixels[x, y] = (15, 23, 42)
    image.save(output)


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("Usage: generate_qr.py <text> <output.png>")
    render(make_qr(sys.argv[1]), Path(sys.argv[2]))


if __name__ == "__main__":
    main()
