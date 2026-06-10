function reduceNumber(num: number): number {

  // Preserve 22
  if (num === 22) {
    return 22;
  }

  // Reduce above 22
  while (num > 22) {

    num = num
      .toString()
      .split("")
      .reduce(
        (sum, digit) =>
          sum + parseInt(digit),
        0
      );

  }

  return num;

}

export default function calculateArcanaCenter(
  birthDate: string | Date
): number {

  const date =
    typeof birthDate === "string"
      ? new Date(birthDate)
      : birthDate;

  if (isNaN(date.getTime())) {
    return 0;
  }

  const day =
    date.getDate();

  const month =
    date.getMonth() + 1;

  const year =
    date.getFullYear();

  // Reduce year digits
  const yearReduced =
    reduceNumber(
      year
        .toString()
        .split("")
        .reduce(
          (sum, digit) =>
            sum + parseInt(digit),
          0
        )
    );

  // GitHub-style Matrix logic
  const apoint =
    reduceNumber(day);

  const bpoint =
    reduceNumber(month);

  const cpoint =
    reduceNumber(yearReduced);

  const dpoint =
    reduceNumber(
      apoint +
      bpoint +
      cpoint
    );

  // Center Arcana
  const mpoint =
    reduceNumber(
      apoint +
      bpoint +
      cpoint +
      dpoint
    );

  return mpoint;

}