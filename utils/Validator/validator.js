class Validator {
    static isEmail(value) {
        if(typeof value !== "string") return false;
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
    }

    static isAlphanumeric(value) {
        if(typeof value !== "string") return false;
        return /^[a-zA-Z0-9]+$/.test(value);
    }

    static isPassword(value, minlength = 4, maxlength = 64, pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])\S+$/) {
        minlength = Number(minlength);
        maxlength = Number(maxlength);

        if(minlength === NaN || maxlength === NaN || !Number.isInteger(minlength) || !Number.isInteger(maxlength) || minlength > maxlength)
            throw new Error("Length values must be valid integers, and the minimum value must not exceed the maximum!");

        return pattern.test(value) && value.length >= minlength && value.length <= maxlength;
    }

    static isEmpty(value) {
        if(Array.isArray(value) || typeof value === "string")
            return value.length === 0;
        if(value instanceof Map || value instanceof Set)
            return value.size === 0;
        if(typeof value === "object" && value !== null && value !== undefined)
            return Object.keys(value).length === 0;

        return value === null || value === undefined;
    }

    static isNumber(value, set = "R") {
        set = set.toLowerCase();

        const SETS = ["R", "Q", "Z", "W", "N"];

        if(!SETS.includes(set)) throw new Error("Only real numbers are supported. Please choose a valid set.");

        if(typeof value !== "string" && typeof value !== "number" && typeof value !== "bigint") return false;

        if(typeof value !== "string") value = value.toString();

        const BIG_INT_REGEX      = /^[+-]?\d+n$/;
        const REAL_NUMBERS_REGEX = /^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/; // Real numbers + optional sci notation

        if(BIG_INT_REGEX.test(value)) return true;
        else if(REAL_NUMBERS_REGEX.test(value)) value = Number(value);
        else return false;

        if(set === "R" || set === "Q") return true; // Includes all real numbers, allowing approximate representations of irrational numbers (Math.PI, Math.E ...)
        if(set === "Z") return Number.isInteger(value);
        if(set === "W") return Number.isInteger(value) && value >= 0;
        if(set === "N") return Number.isInteger(value) && value > 0;
    }

    static isAtMost(value, max) {
        if(typeof value !== "string" && typeof value !== "number" && typeof value !== "bigint" &&
            typeof max !== "string" && typeof max !== "number" && typeof max !== "bigint"
        ) throw new Error("Inputs must be valid numbers!");

        if(typeof value !== "string") value = value.toString();
        if(typeof max !== "string")   max   = max.toString();

        const BIG_INT_REGEX      = /^[+-]?\d+n$/;
        const REAL_NUMBERS_REGEX = /^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/; // Real numbers + optional sci notation

        if(BIG_INT_REGEX.test(value) || BIG_INT_REGEX.test(max)) {
            if(!BIG_INT_REGEX.test(value) && !REAL_NUMBERS_REGEX.test(value) || !BIG_INT_REGEX.test(max) && !REAL_NUMBERS_REGEX.test(max)) throw new Error("Inputs must be valid numbers!");
            value = BigInt(value.replace(/n$/, ""));
            max   = BigInt(max.replace(/n$/, ""));
        } else if(REAL_NUMBERS_REGEX.test(value) && REAL_NUMBERS_REGEX.test(max)) {
            value = Number(value);
            max   = Number(max);
        } else throw new Error("Inputs must be valid numbers!");

        return value <= max;
    }

    static isAtLeast(value, min) {
        if(typeof value !== "string" && typeof value !== "number" && typeof value !== "bigint" &&
            typeof min !== "string" && typeof min !== "number" && typeof min !== "bigint"
        ) throw new Error("Inputs must be valid numbers!");

        if(typeof value !== "string") value = value.toString();
        if(typeof min !== "string")   min   = min.toString();

        const BIG_INT_REGEX      = /^[+-]?\d+n$/;
        const REAL_NUMBERS_REGEX = /^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/; // Real numbers + optional sci notation

        if(BIG_INT_REGEX.test(value) || BIG_INT_REGEX.test(min)) {
            if(!BIG_INT_REGEX.test(value) && !REAL_NUMBERS_REGEX.test(value) || !BIG_INT_REGEX.test(min) && !REAL_NUMBERS_REGEX.test(min)) throw new Error("Inputs must be valid numbers!");
            value = BigInt(value.replace(/n$/, ""));
            min   = BigInt(min.replace(/n$/, ""));
        } else if(REAL_NUMBERS_REGEX.test(value) && REAL_NUMBERS_REGEX.test(min)) {
            value = Number(value);
            min   = Number(min);
        } else throw new Error("Inputs must be valid numbers!");

        return value >= min;
    }

    static isInRange(value, min, max) {
        if(typeof value !== "string" && typeof value !== "number" && typeof value !== "bigint" &&
            typeof min !== "string" && typeof min !== "number" && typeof min !== "bigint" &&
            typeof max !== "string" && typeof max !== "number" && typeof max !== "bigint"
        ) throw new Error("Inputs must be valid numbers!");

        if(typeof value !== "string") value = value.toString();
        if(typeof min !== "string")   min   = min.toString();
        if(typeof max !== "string")   max   = max.toString();

        const BIG_INT_REGEX      = /^[+-]?\d+n$/;
        const REAL_NUMBERS_REGEX = /^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/; // Real numbers + optional sci notation

        if(BIG_INT_REGEX.test(value) || BIG_INT_REGEX.test(min) || BIG_INT_REGEX.test(max)) {
            if(!BIG_INT_REGEX.test(value) && !REAL_NUMBERS_REGEX.test(value) || 
                !BIG_INT_REGEX.test(min) && !REAL_NUMBERS_REGEX.test(min) ||
                !BIG_INT_REGEX.test(max) && !REAL_NUMBERS_REGEX.test(max)
            ) throw new Error("Inputs must be valid numbers!");
            value = BigInt(value.replace(/n$/, ""));
            min   = BigInt(min.replace(/n$/, ""));
            max   = BigInt(max.replace(/n$/, ""));
        } else if(REAL_NUMBERS_REGEX.test(value) && REAL_NUMBERS_REGEX.test(min) && REAL_NUMBERS_REGEX.test(max)) {
            value = Number(value);
            min   = Number(min);
            max   = Number(max);
        } else throw new Error("Inputs must be valid numbers!");

        return value >= min && value <= max;
    }

    static isDate(value, format) {
        if(value instanceof Date) return value.getTime() !== NaN;

        const DATE_FORMAT_REGEX = /^((D{1,2}[^0-9a-zA-Z]?M{1,2}[^0-9a-zA-Z]?Y{1,})|(D{1,2}[^0-9a-zA-Z]?Y{1,}[^0-9a-zA-Z]?M{1,2})|(M{1,2}[^0-9a-zA-Z]?D{1,2}[^0-9a-zA-Z]?Y{1,})|(M{1,2}[^0-9a-zA-Z]?Y{1,}[^0-9a-zA-Z]?D{1,2})|(Y{1,}[^0-9a-zA-Z]?D{1,2}[^0-9a-zA-Z]?M{1,2})|(Y{1,}[^0-9a-zA-Z]?M{1,2}[^0-9a-zA-Z]?D{1,2}))$/;
        if(!DATE_FORMAT_REGEX.test(format)) throw new Error("Invalid format!");

        const FORMAT_PATTERN = format.toLowerCase()
                .replace(/y+|m+|d+/gi, 
                    match => {
                        if (/y+/i.test(match)) return "(?<year>\\d{1,})";
                        if (/m+/i.test(match)) return "(?<month>\\d{1,2})";
                        if (/d+/i.test(match)) return "(?<day>\\d{1,2})";
                    }
        );
        const DATE_VALIDATION_REGEX = new RegExp(`^${FORMAT_PATTERN}$`, "i");

        const match = value.match(DATE_VALIDATION_REGEX);
        const dateObject = { year: parseInt(match.groups.year, 10), month: parseInt(match.groups.month, 10), day: parseInt(match.groups.day, 10) };
        const monthsDays = [ 0, 31, ((dateObject.year % 4 === 0 && dateObject.year % 100 !== 0) || dateObject.year % 400 === 0) ? 28 : 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

        if(dateObject.day > monthsDays[dateObject.month] || dateObject.month > 12 || dateObject.month < 1) return false;

        return true;
    }

    static isDateAtMost(value, max, format = "DD/MM/YYYY") {
        if(value instanceof Date) value = value.getTime();
        if(max instanceof Date)   max   = max.getTime();

        if(value === NaN || max === NaN) throw new Error("Invalid dates!");

        if(typeof value === "number" && typeof max === "number") return value <= max;

        const DATE_FORMAT_REGEX = /^((D{1,2}[^0-9a-zA-Z]?M{1,2}[^0-9a-zA-Z]?Y{1,})|(D{1,2}[^0-9a-zA-Z]?Y{1,}[^0-9a-zA-Z]?M{1,2})|(M{1,2}[^0-9a-zA-Z]?D{1,2}[^0-9a-zA-Z]?Y{1,})|(M{1,2}[^0-9a-zA-Z]?Y{1,}[^0-9a-zA-Z]?D{1,2})|(Y{1,}[^0-9a-zA-Z]?D{1,2}[^0-9a-zA-Z]?M{1,2})|(Y{1,}[^0-9a-zA-Z]?M{1,2}[^0-9a-zA-Z]?D{1,2}))$/;
        if(!DATE_FORMAT_REGEX.test(format)) throw new Error("Invalid format!");

        const FORMAT_PATTERN = format.toLowerCase()
                .replace(/y+|m+|d+/gi, 
                    match => {
                        if (/y+/i.test(match)) return "(?<year>\\d{1,})";
                        if (/m+/i.test(match)) return "(?<month>\\d{1,2})";
                        if (/d+/i.test(match)) return "(?<day>\\d{1,2})";
                    }
        );

        const DATE_VALIDATION_REGEX = new RegExp(`^${FORMAT_PATTERN}$`, "i");

        const valueMatch   = value.match(DATE_VALIDATION_REGEX);
        const valueDateObj = {
            year: parseInt(valueMatch.groups.year, 10),
            month: parseInt(valueMatch.groups.month  , 10),
            day: parseInt(valueMatch.groups.day, 10)
        };
        const monthsDays = [ 
            0,
            31, //Jan
            ((valueDateObj.year % 4 === 0 && valueDateObj.year % 100 !== 0) || valueDateObj.year % 400 === 0) ? 28 : 29, //Feb
            31, //Mar
            30, //Apr
            31, //May
            30, //Jun
            31, //Jul
            31, //Aug
            30, //Sep
            31, //Oct
            30, //Nov
            31  //Dec
        ];
        if(valueDateObj.day > monthsDays[valueDateObj.month] || valueDateObj.month > 12 || valueDateObj.month < 1) throw new Error("Invalid dates!");
  
        const maxMatch   = max.match(DATE_VALIDATION_REGEX);
        const maxDateObj = {
            year: parseInt(maxMatch.groups.year, 10),
            month: parseInt(maxMatch.groups.month, 10),
            day: parseInt(maxMatch.groups.day, 10)
        };
        monthsDays[2] = ((maxDateObj.year % 4 === 0 && maxDateObj.year % 100 !== 0) || maxDateObj.year % 400 === 0) ? 28 : 29;
        if(maxDateObj.day > monthsDays[maxDateObj.month] || maxDateObj.month > 12 || maxDateObj.month < 1) throw new Error("Invalid dates!");

        value = new Date(valueDateObj.year, valueDateObj.month - 1, valueDateObj.day).getTime();
        max   = new Date(maxDateObj.year, maxDateObj.month - 1, maxDateObj.day).getTime();

        return value <= max;
    }

    static isDateAtLeast(value, min, format = "DD/MM/YYYY") {
        if(value instanceof Date) value = value.getTime();
        if(min instanceof Date)   min   = min.getTime();

        if(value === NaN || min === NaN) throw new Error("Invalid dates!");

        if(typeof value === "number" && typeof min === "number") return value >= min;

        const DATE_FORMAT_REGEX = /^((D{1,2}[^0-9a-zA-Z]?M{1,2}[^0-9a-zA-Z]?Y{1,})|(D{1,2}[^0-9a-zA-Z]?Y{1,}[^0-9a-zA-Z]?M{1,2})|(M{1,2}[^0-9a-zA-Z]?D{1,2}[^0-9a-zA-Z]?Y{1,})|(M{1,2}[^0-9a-zA-Z]?Y{1,}[^0-9a-zA-Z]?D{1,2})|(Y{1,}[^0-9a-zA-Z]?D{1,2}[^0-9a-zA-Z]?M{1,2})|(Y{1,}[^0-9a-zA-Z]?M{1,2}[^0-9a-zA-Z]?D{1,2}))$/;
        if(!DATE_FORMAT_REGEX.test(format)) throw new Error("Invalid format!");

        const FORMAT_PATTERN = format.toLowerCase()
                .replace(/y+|m+|d+/gi, 
                    match => {
                        if (/y+/i.test(match)) return "(?<year>\\d{1,})";
                        if (/m+/i.test(match)) return "(?<month>\\d{1,2})";
                        if (/d+/i.test(match)) return "(?<day>\\d{1,2})";
                    }
        );

        const DATE_VALIDATION_REGEX = new RegExp(`^${FORMAT_PATTERN}$`, "i");

        const valueMatch   = value.match(DATE_VALIDATION_REGEX);
        const valueDateObj = {
            year: parseInt(valueMatch.groups.year, 10),
            month: parseInt(valueMatch.groups.month  , 10),
            day: parseInt(valueMatch.groups.day, 10)
        };
        const monthsDays = [ 
            0,
            31, //Jan
            ((valueDateObj.year % 4 === 0 && valueDateObj.year % 100 !== 0) || valueDateObj.year % 400 === 0) ? 28 : 29, //Feb
            31, //Mar
            30, //Apr
            31, //May
            30, //Jun
            31, //Jul
            31, //Aug
            30, //Sep
            31, //Oct
            30, //Nov
            31  //Dec
        ];
        if(valueDateObj.day > monthsDays[valueDateObj.month] || valueDateObj.month > 12 || valueDateObj.month < 1) throw new Error("Invalid dates!");
  
        const minMatch   = min.match(DATE_VALIDATION_REGEX);
        const minDateObj = {
            year: parseInt(minMatch.groups.year, 10),
            month: parseInt(minMatch.groups.month, 10),
            day: parseInt(minMatch.groups.day, 10)
        };
        monthsDays[2] = ((minDateObj.year % 4 === 0 && minDateObj.year % 100 !== 0) || minDateObj.year % 400 === 0) ? 28 : 29;
        if(minDateObj.day > monthsDays[minDateObj.month] || minDateObj.month > 12 || minDateObj.month < 1) throw new Error("Invalid dates!");

        value = new Date(valueDateObj.year, valueDateObj.month - 1, valueDateObj.day).getTime();
        min   = new Date(minDateObj.year, minDateObj.month - 1, minDateObj.day).getTime();

        return value >= min;
    }

    static isDateInRange(value, min, max, format = "DD/MM/YYYY") {
        if(value instanceof Date) value = value.getTime();
        if(min instanceof Date)   min   = min.getTime();
        if(max instanceof Date)   max   = max.getTime();

        if(value === NaN || min === NaN || max === NaN) throw new Error("Invalid dates!");

        if(typeof value === "number" && typeof min === "number" && typeof max === "number") return value >= min && value <= max;

        const DATE_FORMAT_REGEX = /^((D{1,2}[^0-9a-zA-Z]?M{1,2}[^0-9a-zA-Z]?Y{1,})|(D{1,2}[^0-9a-zA-Z]?Y{1,}[^0-9a-zA-Z]?M{1,2})|(M{1,2}[^0-9a-zA-Z]?D{1,2}[^0-9a-zA-Z]?Y{1,})|(M{1,2}[^0-9a-zA-Z]?Y{1,}[^0-9a-zA-Z]?D{1,2})|(Y{1,}[^0-9a-zA-Z]?D{1,2}[^0-9a-zA-Z]?M{1,2})|(Y{1,}[^0-9a-zA-Z]?M{1,2}[^0-9a-zA-Z]?D{1,2}))$/;
        if(!DATE_FORMAT_REGEX.test(format)) throw new Error("Invalid format!");

        const FORMAT_PATTERN = format.toLowerCase()
                .replace(/y+|m+|d+/gi, 
                    match => {
                        if (/y+/i.test(match)) return "(?<year>\\d{1,})";
                        if (/m+/i.test(match)) return "(?<month>\\d{1,2})";
                        if (/d+/i.test(match)) return "(?<day>\\d{1,2})";
                    }
        );

        const DATE_VALIDATION_REGEX = new RegExp(`^${FORMAT_PATTERN}$`, "i");

        const valueMatch   = value.match(DATE_VALIDATION_REGEX);
        const valueDateObj = {
            year: parseInt(valueMatch.groups.year, 10),
            month: parseInt(valueMatch.groups.month  , 10),
            day: parseInt(valueMatch.groups.day, 10)
        };
        const monthsDays = [ 
            0,
            31, //Jan
            ((valueDateObj.year % 4 === 0 && valueDateObj.year % 100 !== 0) || valueDateObj.year % 400 === 0) ? 28 : 29, //Feb
            31, //Mar
            30, //Apr
            31, //May
            30, //Jun
            31, //Jul
            31, //Aug
            30, //Sep
            31, //Oct
            30, //Nov
            31  //Dec
        ];
        if(valueDateObj.day > monthsDays[valueDateObj.month] || valueDateObj.month > 12 || valueDateObj.month < 1) throw new Error("Invalid dates!");
  
        const minMatch   = min.match(DATE_VALIDATION_REGEX);
        const minDateObj = {
            year: parseInt(minMatch.groups.year, 10),
            month: parseInt(minMatch.groups.month, 10),
            day: parseInt(minMatch.groups.day, 10)
        };
        monthsDays[2] = ((minDateObj.year % 4 === 0 && minDateObj.year % 100 !== 0) || minDateObj.year % 400 === 0) ? 28 : 29;
        if(minDateObj.day > monthsDays[minDateObj.month] || minDateObj.month > 12 || minDateObj.month < 1) throw new Error("Invalid dates!");

        const maxMatch   = max.match(DATE_VALIDATION_REGEX);
        const maxDateObj = {
            year: parseInt(maxMatch.groups.year, 10),
            month: parseInt(maxMatch.groups.month, 10),
            day: parseInt(maxMatch.groups.day, 10)
        };
        monthsDays[2] = ((maxDateObj.year % 4 === 0 && maxDateObj.year % 100 !== 0) || maxDateObj.year % 400 === 0) ? 28 : 29;
        if(maxDateObj.day > monthsDays[maxDateObj.month] || maxDateObj.month > 12 || maxDateObj.month < 1) throw new Error("Invalid dates!");
        
        value = new Date(valueDateObj.year, valueDateObj.month - 1, valueDateObj.day).getTime();
        min   = new Date(minDateObj.year, minDateObj.month - 1, minDateObj.day).getTime();
        max   = new Date(maxDateObj.year, maxDateObj.month - 1, maxDateObj.day).getTime();

        return value >= min && value <= max;
    }
}

if (typeof module !== "undefined" && module.exports)  module.exports = Validator;