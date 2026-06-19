export type DestinyMatrixGoldenFixture = {
  name: "Widhi" | "Aya" | "Sheina" | "Bayu";
  dateOfBirth: string;
  structuralValues: number[];
  projections: {
    center: number[];
    love: number[];
    money: number[];
    karmic: number[];
    father: number[];
    mother: number[];
    social: number[];
  };
};

export const DESTINY_MATRIX_GOLDEN_FIXTURES: DestinyMatrixGoldenFixture[] = [
  {
    name: "Widhi", dateOfBirth: "1985-05-03",
    structuralValues: [3,5,5,13,8,8,10,16,18,21,13,11,13,14,18,18,7,19,21,7,10,20,7,15,15,5,17,9,5,21,7,7],
    projections: { center: [8], love: [11,8,13], money: [21,8,13], karmic: [13,7,21], father: [8,10,5], mother: [16,18,13], social: [16] },
  },
  {
    name: "Aya", dateOfBirth: "2012-06-16",
    structuralValues: [16,6,5,9,9,22,11,7,14,18,14,7,15,5,21,19,9,16,6,5,5,19,9,18,4,8,20,4,16,5,5,19],
    projections: { center: [9], love: [7,9,15], money: [18,9,14], karmic: [9,9,18], father: [22,11,5], mother: [7,14,9], social: [9] },
  },
  {
    name: "Sheina", dateOfBirth: "1988-10-17",
    structuralValues: [17,10,8,8,7,9,18,7,16,15,15,6,17,5,9,5,5,13,6,3,18,18,5,12,14,5,5,5,12,19,21,10],
    projections: { center: [7], love: [6,7,17], money: [15,7,15], karmic: [8,5,15], father: [9,18,8], mother: [7,16,8], social: [14] },
  },
  {
    name: "Bayu", dateOfBirth: "1989-01-06",
    structuralValues: [6,1,9,16,5,7,10,22,7,21,14,11,6,17,7,5,10,16,11,8,11,22,10,15,17,6,20,3,5,9,17,6],
    projections: { center: [5], love: [11,5,6], money: [21,5,14], karmic: [16,10,21], father: [7,10,9], mother: [22,7,16], social: [19] },
  },
];

