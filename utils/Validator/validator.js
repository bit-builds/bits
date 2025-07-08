const Validator = (() => {
    const BIG_INT_REGEX      = /^[+-]?\d+n$/;
    const REAL_NUMBERS_REGEX = /^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/; // Real numbers + optional sci notation

    const monthsDays = [ 
            0,
            31, //Jan
            28, //Feb
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

    const isValidDateFormat = (format) => {
        const DATE_FORMAT_REGEX = /^((D{1,2}[^0-9a-zA-Z]?M{1,2}[^0-9a-zA-Z]?Y{1,})|(D{1,2}[^0-9a-zA-Z]?Y{1,}[^0-9a-zA-Z]?M{1,2})|(M{1,2}[^0-9a-zA-Z]?D{1,2}[^0-9a-zA-Z]?Y{1,})|(M{1,2}[^0-9a-zA-Z]?Y{1,}[^0-9a-zA-Z]?D{1,2})|(Y{1,}[^0-9a-zA-Z]?D{1,2}[^0-9a-zA-Z]?M{1,2})|(Y{1,}[^0-9a-zA-Z]?M{1,2}[^0-9a-zA-Z]?D{1,2}))$/;
        return DATE_FORMAT_REGEX.test(format);
    };

    const extractDate = (dateString, format) => {
        const FORMAT_PATTERN = format.toLowerCase()
                .replace(/y+|m+|d+/gi, 
                    match => {
                        if (/y+/i.test(match)) return "(?<year>\\d{1,})";
                        if (/m+/i.test(match)) return "(?<month>\\d{1,2})";
                        if (/d+/i.test(match)) return "(?<day>\\d{1,2})";
                    }
        );
        const DATE_VALIDATION_REGEX = new RegExp(`^${FORMAT_PATTERN}$`, "i");
        const match = dateString.match(DATE_VALIDATION_REGEX);
        if(!match) return false;
        return { 
            year: parseInt(match.groups.year, 10),
            month: parseInt(match.groups.month, 10),
            day: parseInt(match.groups.day, 10)
        };
    };

    return class Validator {
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
            set = set.toUpperCase();
            if(!["R", "Q", "Z", "W", "N"].includes(set)) throw new Error("Only real numbers are supported. Please choose a valid set.");
            if(typeof value !== "string" && typeof value !== "number") return false;
            if(typeof value !== "string") value = value.toString();
            if(REAL_NUMBERS_REGEX.test(value)) {
                if(set === "R" || set === "Q") return true; // Includes all real numbers, allowing approximate representations of irrational numbers (Math.PI, Math.E ...)
                value = Number(value);
                if(set === "Z") return Number.isInteger(value);
                if(set === "W") return Number.isInteger(value) && value >= 0;
                if(set === "N") return Number.isInteger(value) && value > 0;
            }
            return false;
        }

        static isBigInt(value) {
            if(typeof value === "bigint") return true;
            if(typeof value !== "string") return false;
            if(BIG_INT_REGEX.test(value)) return true;
            return false;
        }

        static isAtLeast(value, min) {
            if(typeof value !== "string" && typeof value !== "number" && typeof value !== "bigint" &&
                typeof min !== "string" && typeof min !== "number" && typeof min !== "bigint"
            ) throw new Error("Inputs must be valid numbers!");
            if(typeof value !== "string") value = value.toString();
            if(typeof min !== "string")   min   = min.toString();
            if(BIG_INT_REGEX.test(value) || BIG_INT_REGEX.test(min)) {
                if(!BIG_INT_REGEX.test(value) && !REAL_NUMBERS_REGEX.test(value) || !BIG_INT_REGEX.test(min) && !REAL_NUMBERS_REGEX.test(min)) 
                    throw new Error("Inputs must be valid numbers!");
                value = BigInt(value.replace(/n$/, ""));
                min   = BigInt(min.replace(/n$/, ""));
            } else if(REAL_NUMBERS_REGEX.test(value) && REAL_NUMBERS_REGEX.test(min)) {
                value = Number(value);
                min   = Number(min);
            } else throw new Error("Inputs must be valid numbers!");
            return value >= min;
        }

        static isAtMost(value, max) {
            if(typeof value !== "string" && typeof value !== "number" && typeof value !== "bigint" &&
                typeof max !== "string" && typeof max !== "number" && typeof max !== "bigint"
            ) throw new Error("Inputs must be valid numbers!");
            if(typeof value !== "string") value = value.toString();
            if(typeof max !== "string")   max   = max.toString();
            if(BIG_INT_REGEX.test(value) || BIG_INT_REGEX.test(max)) {
                if(!BIG_INT_REGEX.test(value) && !REAL_NUMBERS_REGEX.test(value) || !BIG_INT_REGEX.test(max) && !REAL_NUMBERS_REGEX.test(max))
                    throw new Error("Inputs must be valid numbers!");
                value = BigInt(value.replace(/n$/, ""));
                max   = BigInt(max.replace(/n$/, ""));
            } else if(REAL_NUMBERS_REGEX.test(value) && REAL_NUMBERS_REGEX.test(max)) {
                value = Number(value);
                max   = Number(max);
            } else throw new Error("Inputs must be valid numbers!");
            return value <= max;
        }

        static isInRange(value, min, max) {
            if(typeof value !== "string" && typeof value !== "number" && typeof value !== "bigint" &&
                typeof min !== "string" && typeof min !== "number" && typeof min !== "bigint" &&
                typeof max !== "string" && typeof max !== "number" && typeof max !== "bigint"
            ) throw new Error("Inputs must be valid numbers!");
            if(typeof value !== "string") value = value.toString();
            if(typeof min !== "string")   min   = min.toString();
            if(typeof max !== "string")   max   = max.toString();
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

        static isEmail(value) {
            if(typeof value !== "string") return false;
            return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
        }

        static isPassword(value, minlength = 4, maxlength = 64, pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])\S+$/) {
            minlength = Number(minlength);
            maxlength = Number(maxlength);

            if(minlength === NaN || maxlength === NaN || !Number.isInteger(minlength) || !Number.isInteger(maxlength) || minlength > maxlength)
                throw new Error("Length values must be valid integers, and the minimum value must not exceed the maximum!");

            return pattern.test(value) && value.length >= minlength && value.length <= maxlength;
        }

        static isTel(value, format) {
            if (typeof format !== 'string') throw new Error('Format argument must be a string'); 
            if (typeof value !== 'string') return false;

            format = (format.length >= 0) ? format : 'SSSSSSSSSS'; // syntax ->  + C{1,3} N{1,5} S{1,10} alphanum E{1,5}    
            let FORMAT_REGEX = /^((\+)?([^a-zA-Z0-9]*)(C{0,3}))?([^a-zA-Z0-9]*)(N{0,5})?([^a-zA-Z0-9]*)(S{1,10})([^a-zA-Z0-9]*)(([a-z]|[^a-zA-Z0-9])*(E{1,5}))?$/;
            if (!FORMAT_REGEX.test(format)) throw new Error('Invalid format!');
        
            let pattern = '',
                i = 0;
            while (i < format.length) {
                if (['C', 'N', 'S', 'E'].includes(format[i])) {
                    const placeholder = format[i];
                    while (i < format.length && format[i] === placeholder) {
                        pattern += `[0-9]`;
                        i++;
                    }
                } 
                else if (/[^a-zA-Z0-9]/.test(format[i])) {
                    const specialChar = format[i];
                    while (i < format.length && format[i] === specialChar) {
                        pattern += `\\${char}`;
                        i++;
                    }
                } 
                else {
                    pattern += `\\${format[i]}`;
                    i++;
                }
            }
        
            return new RegExp('^' + pattern + '$').test(value);
        }

        static isURL(value, options) {
            let genDelims = `[:\\/\\?\\#\\[\\]\\@]`;
            let subDelims = `[\\*\\+,;=]`;
            let reserved = `(${genDelims}|${subDelims})`;
            let unreserved = `([a-zA-Z0-9\\-\\.\\_\\~])`;
            let pctEncoded = `%[0-9a-fA-F]{2}`;
        
            let pchar = `(${unreserved}|${pctEncoded}|${subDelims}|[:@])`;
            let fragment = `(${pchar}|[\\/\\?])*`;
            let query = `(${pchar}|[\\/\\?])*`;
        
            let segmentNZNC = `(${unreserved}|${pctEncoded}|${subDelims}|@)+`;
            let segmentNZ = `${pchar}+`;
            let segment = `${pchar}*`;
        
            let pathEmpty = ``;
            let pathRootless = `${segmentNZ}(\\/${segment})*`;
            let pathNoscheme = `${segmentNZNC}(\\/${segment})*`;
            let pathAbsolute = `\\/((${segmentNZ}(\\/${segment})*)?)`;
            let pathAbempty = `(\\/${segment})*`;
            let path = `(${pathAbempty}|${pathAbsolute}|${pathNoscheme}|${pathRootless}|${pathEmpty})`;
        
            let regName = `(${unreserved}|${pctEncoded}|${subDelims})*`;
            let decOctet = `([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])`;
            let ipv4Adress = `${decOctet}\\.${decOctet}\\.${decOctet}\\.${decOctet}`;
            let h16 = `[0-9a-fA-F]{1,4}`;
            let ls32 = `((${h16}:${h16})|${ipv4Adress})`;
        
            let ipv6Address = `(
                (${h16}:){6}${ls32} |
                ::((${h16}:){5}${ls32})? |
                (${h16})?::(${h16}:){4}${ls32} |
                ((${h16}:){0,1}${h16})?::(${h16}:){3}${ls32} |
                ((${h16}:){0,2}${h16})?::(${h16}:){2}${ls32} |
                ((${h16}:){0,3}${h16})?::${h16}:${ls32} |
                ((${h16}:){0,4}${h16})?::${ls32} |        
                ((${h16}:){0,5}${h16})?::${h16} |
                ((${h16}:){0,6}${h16})?::
            )`.replace(/\s+/g, ''); // Remove unnecessary whitespace
        
            let ipvFuture = `v[0-9a-fA-F]+\\.(${unreserved}|${subDelims}|:)+`;
            let ipLiteral = `\\[(${ipv6Address}|${ipvFuture})\\]`;
            let port = `[0-9]*`;
            let host = `(${ipLiteral}|${ipv4Adress}|${regName})`;
            let userInfo = `(${unreserved}|${pctEncoded}|${subDelims}|:)*`;
            let authority = `(${userInfo}@)?${host}(:${port})?`;
            let scheme = `[a-zA-Z]([a-zA-Z0-9\\+\\-\\.]*)`;
        
            let relativePart = `(\\/\\/${authority}${pathAbempty}|${pathAbsolute}|${pathNoscheme}|${pathEmpty})`;
            let hierPart = `(\\/\\/${authority}${pathAbempty}|${pathAbsolute}|${pathRootless}|${pathEmpty})`;
            let relativeRef = `${relativePart}(\\?${query})?(#${fragment})?`;
            let absoluteUri = `${scheme}:${hierPart}(\\?${query})?`;
            let uri = `${scheme}:${hierPart}(\\?${query})?(#${fragment})?`;
            let uriReference = `(${uri}|${relativeRef})`;
        
            let isPath         = new RegExp('^' + path         + '$', 'g').test(value);
            let isRelativeRef  = new RegExp('^' + relativeRef  + '$', 'g').test(value);
            let isAbsoluteUri  = new RegExp('^' + absoluteUri  + '$', 'g').test(value);
            let isUriReference = new RegExp('^' + uriReference + '$', 'g').test(value);
            return isUriReference;
        }

        static isDate(value, format = "DD/MM/YYYY") {
            if(value instanceof Date) return value.getTime() !== NaN;
            if(!isValidDateFormat(format)) throw new Error("Invalid format!");
            const dateObject = extractDate(value, format);
            if(!dateObject) return false;
            monthsDays[2] = ((dateObject.year % 4 === 0 && dateObject.year % 100 !== 0) || dateObject.year % 400 === 0) ? 28 : 29;
            if(dateObject.day > monthsDays[dateObject.month] ||
                dateObject.day < 1 || dateObject.month > 12 || dateObject.month < 1 ||
                dateObject.year === 0) return false;
            return true;
        }

        static isDateAtLeast(value, min, format = "DD/MM/YYYY") {
            if(value instanceof Date) value = value.getTime();
            if(min instanceof Date) min = min.getTime();
            if(Number.isNaN(value) || Number.isNaN(min)) throw new Error("Invalid dates!");
            if(typeof value === "number" && typeof min === "number") return value >= min;
            if(!isValidDateFormat(format)) throw new Error("Invalid format!");
            if(!Validator.isDate(value, format) || !Validator.isDate(min, format)) throw new Error("Invalid dates!");
            const dateObject = extractDate(value, format), minDateObj = extractDate(min, format);
            value = new Date(dateObject.year, dateObject.month - 1, dateObject.day).getTime();
            min   = new Date(minDateObj.year, minDateObj.month - 1, minDateObj.day).getTime();
            return value >= min;
        }

        static isDateAtMost(value, max, format = "DD/MM/YYYY") {
            if(value instanceof Date) value = value.getTime();
            if(max instanceof Date) max = max.getTime();
            if(Number.isNaN(value) || Number.isNaN(max)) throw new Error("Invalid dates!");
            if(typeof value === "number" && typeof max === "number") return value <= max;
            if(!isValidDateFormat(format)) throw new Error("Invalid format!");
            if(!Validator.isDate(value, format) || !Validator.isDate(max, format)) throw new Error("Invalid dates!");
            const dateObject = extractDate(value, format), maxDateObj = extractDate(max, format);
            value = new Date(dateObject.year, dateObject.month - 1, dateObject.day).getTime();
            max   = new Date(maxDateObj.year, maxDateObj.month - 1, maxDateObj.day).getTime();
            return value <= max;
        }

        static isDateInRange(value, min, max, format = "DD/MM/YYYY") {
            if(value instanceof Date) value = value.getTime();
            if(min instanceof Date) min = min.getTime();
            if(max instanceof Date) max = max.getTime();
            if(Number.isNaN(value) || Number.isNaN(min) || Number.isNaN(max)) throw new Error("Invalid dates!");
            if(typeof value === "number" && typeof min === "number" && typeof max === "number") return value >= min && value <= max;
            if(!isValidDateFormat(format)) throw new Error("Invalid format!");
            if(!Validator.isDate(value, format) || !Validator.isDate(min, format) || !Validator.isDate(max, format))
                throw new Error("Invalid dates!");
            const dateObject = extractDate(value, format), minDateObj = extractDate(min, format), maxDateObj = extractDate(max, format);
            value = new Date(dateObject.year, dateObject.month - 1, dateObject.day).getTime();
            min   = new Date(minDateObj.year, minDateObj.month - 1, minDateObj.day).getTime();
            max   = new Date(maxDateObj.year, maxDateObj.month - 1, maxDateObj.day).getTime();
            return value >= min && value <= max;
        }
    };
});

if(typeof module !== "undefined" && module.exports)  module.exports = Validator();