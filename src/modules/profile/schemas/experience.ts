export type WorkExperience = {
  company: string;
  designation: string;
  location: string;
  timeline: string;
};

export type Certification = {
  name: string;
  fileUrl: string;
  fileKey: string;
};

export const emptyWorkExperience = (): WorkExperience => ({
  company: "",
  designation: "",
  location: "",
  timeline: ""
});

export const emptyCertification = (): Certification => ({
  name: "",
  fileUrl: "",
  fileKey: ""
});
