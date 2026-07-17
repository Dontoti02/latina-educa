type NestedObject = { [key: string]: unknown };

export class FormatBodyRequest {
  static toSnakeCase<T extends NestedObject>(obj: T): NestedObject {
    if (Array.isArray(obj)) {
      return obj.map((item) =>
        item !== null && typeof item === "object"
          ? FormatBodyRequest.toSnakeCase(item as NestedObject)
          : item,
      ) as unknown as NestedObject;
    }

    return Object.entries(obj).reduce<NestedObject>((acc, [key, value]) => {
      const snakeKey = key.replace(
        /[A-Z]/g,
        (letter) => `_${letter.toLowerCase()}`,
      );

      if (value !== null && typeof value === "object") {
        acc[snakeKey] = FormatBodyRequest.toSnakeCase(value as NestedObject);
      } else {
        acc[snakeKey] = value;
      }

      return acc;
    }, {});
  }
}
