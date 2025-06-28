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

    static isNumber(value, set = "real") {
        set = set.toLowerCase();

        const SETS = ["real", "rational", "integer", "whole", "natural"];

        if(!SETS.includes(set)) throw new Error("Only real numbers are supported. Please choose a valid set.");

        if(typeof value !== "string" && typeof value !== "number" && typeof value !== "bigint") return false;

        if(typeof value !== "string") value = value.toString();

        const BIG_INT_REGEX      = /^[+-]?\d+n$/;
        const REAL_NUMBERS_REGEX = /^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/; // Real numbers + optional sci notation

        if(BIG_INT_REGEX.test(value)) return true;
        else if(REAL_NUMBERS_REGEX.test(value)) value = Number(value);
        else return false;

        if(set === "real")    return true; // Includes all real numbers, allowing approximate representations of irrational numbers (Math.PI, Math.E ...)
        if(set === "integer") return Number.isInteger(value);
        if(set === "whole")   return Number.isInteger(value) && value >= 0;
        if(set === "natural") return Number.isInteger(value) && value > 0;
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

        let pattern = "", i = 0;
        while (i < format.length) {
            if (format[i] === "D") {
                let count = 0;
                while (format[i] === "D") { count++; i++; }
                pattern += count === 1 ? "([1-9])" : "(0[1-9]|[1-2][0-9]|3[0-1])";
                continue;
            }

            if (format[i] === "M") {
                let count = 0;
                while (format[i] === "M") { count++; i++; }
                pattern += count === 1 ? "([1-9])" : "(0[1-9]|1[0-2])";
                continue;
            }

            if (format[i] === "Y") {
                let count = 0;
                while (format[i] === "Y") { count++; i++; }
                if (count === 2) pattern += "([0-9]{2})";
                else if (count === 4) pattern += "([0-9]{4})";
                else throw new Error("Year format must be either YY or YYYY!");
                continue;
            }

            if (/[^0-9a-zA-Z]/.test(format[i])) pattern += "\\" + format[i];
            else throw new Error("Invalid character in format!");

            i++;
        }

        const DATE_REGEX = new RegExp('^' + pattern + '$', 'g');
        if(!DATE_REGEX.test(value)) return false; // The date does not conform to the specified format

        const FORMAT_PATTERN = format.toLowerCase()
                .replace(/y+|m+|d+/gi, 
                    match => {
                        if (/y+/i.test(match)) return '(?<year>\\d{1,})';
                        if (/m+/i.test(match)) return '(?<month>\\d{1,2})';
                        if (/d+/i.test(match)) return '(?<day>\\d{1,2})';
                    }
        );
        const DATE_VALIDATION_REGEX = new RegExp(`^${FORMAT_PATTERN}$`, 'i');

        const match = value.match(DATE_VALIDATION_REGEX);
        const dateObject = { year: parseInt(match.groups.year), month: parseInt(match.groups.month), day: parseInt(match.groups.day) };
        const monthsDays = [ 0, 31, ((dateObject.year % 4 === 0 && dateObject.year % 100 !== 0) || dateObject.year % 400 === 0) ? 28 : 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

        if(dateObject.day > monthsDays[dateObject.month] || dateObject.month > 12 || dateObject.month < 1) return false;

        return true;
    }
}

if (typeof module !== "undefined" && module.exports)  module.exports = Validator;