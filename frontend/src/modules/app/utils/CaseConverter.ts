type SnakeCaseObject<T> = {
    [K in keyof T as Uncapitalize<string & K>]: T[K]
};

type CamelCaseObject<T> = {
    [K in keyof T as Capitalize<string & K>]: T[K]
};

export class CaseConverter {
    static snakeToCamel<SnakeCaseObject,CamelCaseObject>(obj: SnakeCaseObject): CamelCaseObject {
        const camelCaseObj: any = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const camelKey = key.replace(/_([a-z])/g, (match, char) => char.toUpperCase());
                const value = obj[key];
                camelCaseObj[camelKey] = CaseConverter.isISO8601Date(value as string) ?  CaseConverter.formatISO8601Date(value as string) : value;
            }
        }
        return camelCaseObj as CamelCaseObject;
    }

    static camelToSnake<T>(obj: CamelCaseObject<T>): SnakeCaseObject<T> {
        const snakeCaseObj: any = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const snakeKey = key.replace(/[A-Z]/g, (match) => `_${match.toLowerCase()}`);
                snakeCaseObj[snakeKey] = obj[key];
            }
        }
        return snakeCaseObj;
    }


    private static isISO8601Date(value:string) {
        return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{6}Z$/.test(value);
    }

    private static formatISO8601Date(value:string) {
            const dt = new Date(Date.parse(value));
            const localDate = dt;
            const gmt = localDate;
            const min = gmt.getTime() / 1000 / 60; 
            const localNow = new Date().getTimezoneOffset(); 
            const localTime = min - localNow; 
            const dateStr = new Date(localTime * 1000 * 60);
            const dateStrDate = dateStr.toLocaleDateString();
        return dateStrDate;
    }
}
