const Validator = (() => {
    const BIG_INT_REGEX           = /^[+-]?\d+n$/;
    const REAL_NUMBERS_REGEX      = /^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/; // Real numbers + optional sci notation
    const FRACTION_NOTATION_REGEX = /^([+-]?)(\d+)\/(0*[1-9]\d*)$/;
    const BINARY_REGEX            = /^[01]+$/;
    const OCTAL_REGEX             = /^[0-7]+$/;
    const HEXADECIMAL_REGEX       = /^[0-9ABCDF]+$/;

    const months_days = [ 
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

    const supported_types = [
        "text",
        "password",
        "email",
        "number",
        "tel",
        "url",
        "date",
        "select"
    ];

    const min_max_types = [
        "number",
        "range"
    ];

    const length_types = [
        "text",
        "password",
        "email",
        "tel",
        "url"
    ];

    const isValidDate_format = (format) => {
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

    return {
        REAL    : "R",
        RATIONAL: "Q",
        INTEGER : "Z",
        WHOLE   : "W",
        NATURAL : "N",

        isEmpty: (value) => {
            if(Array.isArray(value) || typeof value === "string")
                return value.length === 0;

            if(value instanceof Map || value instanceof Set)
                return value.size === 0;

            if(typeof value === "object" && value !== null && value !== undefined)
                return Object.keys(value).length === 0;

            return value === null || value === undefined;
        },

        isNumber: (value, set = Validator.REAL) => {
            set = set.toUpperCase();
            if(!["R", "Q", "Z", "W", "N"].includes(set)) set = "R";
            
            if(typeof value !== "string" && typeof value !== "number") return false;
            
            if(REAL_NUMBERS_REGEX.test(value.toString())) {
                if(set === "R" || set === "Q") return true; // Includes all real numbers, allowing approximate representations of irrational numbers (Math.PI, Math.E ...)
                value = Number(value);
                if(set === "Z") return Number.isInteger(value);
                if(set === "W") return Number.isInteger(value) && value >= 0;
                if(set === "N") return Number.isInteger(value) && value > 0;
            } 
            else if(FRACTION_NOTATION_REGEX.test(value.toString())) {
                if(set === "R" || set === "Q") return true;

                let [full, sign, numerator, denominator] = value.toString().match(FRACTION_NOTATION_REGEX);
                numerator   = Number(numerator);
                denominator = Number(denominator);
                const ratio = numerator / denominator;
                if(set === "Z") return Number.isInteger(ratio);
                if(set === "W" || set === "N") return Number.isInteger(ratio) && sign !== "-";
            }
            
            return false;
        },

        isBigInt: (value) => {
            if(typeof value === "bigint") return true;
            if(typeof value !== "string") return false;
            if(BIG_INT_REGEX.test(value)) return true;
            return false;
        },

        isMultipleOf : (value, factor) => {
            if(typeof value !== "string" && typeof value !== "number" && typeof value !== "bigint" &&
                typeof factor !== "string" && typeof factor !== "number" && typeof factor !== "bigint"
            ) throw new Error("Inputs must be valid numbers!");

            if(typeof value !== "string")  value  = value.toString();
            if(typeof factor !== "string") factor = factor.toString();

            if(BIG_INT_REGEX.test(value) || BIG_INT_REGEX.test(factor)) {
                if(!BIG_INT_REGEX.test(value) && !REAL_NUMBERS_REGEX.test(value) || !BIG_INT_REGEX.test(factor) && !REAL_NUMBERS_REGEX.test(factor)) 
                    throw new Error("Inputs must be valid numbers!");

                value  = BigInt(value.replace(/n$/, ""));
                factor = BigInt(factor.replace(/n$/, ""));

            }
            else if(REAL_NUMBERS_REGEX.test(value) && REAL_NUMBERS_REGEX.test(factor)) {
                value  = Number(value);
                factor = Number(factor);
            }
            else throw new Error("Inputs must be valid numbers!");
            
            return (value % factor) === 0;
        },

        isBinary: (value) => {
            if(typeof value !== "string" && typeof value !== "number") return false;

            value = value.toString().toLowerCase();
            if(value.startsWith("0b")) value = value.slice(2);

            return BINARY_REGEX.test(value) && value.includes("1");
        },

        isOctal: (value) => {
            if(typeof value !== "string" && typeof value !== "number") return false;

            value = value.toString().toLowerCase();
            if(value.startsWith("0o")) value = value.slice(2);

            return OCTAL_REGEX.test(value) && parseInt(value, 8) > 0;
        },

        isHex: (value) => {
            if(typeof value !== "string" && typeof value !== "number") return false;

            value = value.toString().toUpperCase();
            if(value.startsWith("0X")) value = value.slice(2);
            else if(value.startsWith("#")) value = value.slice(1);

            return HEXADECIMAL_REGEX.test(value) && parseInt(value, 16) > 0;
        },

        isAtLeast: (value, min) => {
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
            }
            else if(REAL_NUMBERS_REGEX.test(value) && REAL_NUMBERS_REGEX.test(min)) {
                value = Number(value);
                min   = Number(min);
            }
            else throw new Error("Inputs must be valid numbers!");

            return value >= min;
        },

        isAtMost: (value, max) => {
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
            }
            else if(REAL_NUMBERS_REGEX.test(value) && REAL_NUMBERS_REGEX.test(max)) {
                value = Number(value);
                max   = Number(max);
            }
            else throw new Error("Inputs must be valid numbers!");

            return value <= max;
        },

        isInRange: (value, min, max) => {
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
            }
            else if(REAL_NUMBERS_REGEX.test(value) && REAL_NUMBERS_REGEX.test(min) && REAL_NUMBERS_REGEX.test(max)) {
                value = Number(value);
                min   = Number(min);
                max   = Number(max);
            }
            else throw new Error("Inputs must be valid numbers!");

            return value >= min && value <= max;
        },

        isEmail: (value) => {
            if(typeof value !== "string") return false;
            return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
        },

        isPassword: (value, minlength = 1, maxlength = 64, regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])\S+$/) => {
            minlength = Number(minlength);
            maxlength = Number(maxlength);

            if(Number.isNaN(minlength) || Number.isNaN(maxlength) || !Number.isInteger(minlength) || !Number.isInteger(maxlength) || minlength > maxlength)
                throw new Error("Length values must be valid integers, and the minimum value must not exceed the maximum!");

            return regex.test(value) && value.length >= minlength && value.length <= maxlength;
        },

        isAlphanum: (value) => {
            if(typeof value !== "string") return false;
            return /^[a-zA-Z0-9]+$/.test(value);
        },

        hasSpecialChar: (value) => {
            if(typeof value !== "string") return false;
            return /[^a-zA-Z0-9\s]/.test(value);
        },

        isTel: (value, format = 'SSSSSSSSSS') => {
            if (typeof format !== 'string') throw new Error('Format argument must be a string'); 
            if (typeof value !== 'string') return false;

            // syntax ->  + C{1,3} N{1,5} S{1,10} alphanum E{1,5}    
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
        },

        isURL: (value, options) => {
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
        },

        isDate: (value, format = "DD/MM/YYYY") => {
            if(value instanceof Date) return !Number.isNaN(value.getTime());

            if(!isValidDate_format(format)) throw new Error("Invalid format!");

            const dateObject = extractDate(value, format);

            if(!dateObject) return false;

            months_days[2] = ((dateObject.year % 4 === 0 && dateObject.year % 100 !== 0) || dateObject.year % 400 === 0) ? 28 : 29;

            if(dateObject.day > months_days[dateObject.month] ||
                dateObject.day < 1 || dateObject.month > 12 || dateObject.month < 1 ||
                dateObject.year === 0) return false;

            return true;
        },

        isDateAtLeast: (value, min, format = "DD/MM/YYYY") => {
            if(value instanceof Date) value = value.getTime();

            if(min instanceof Date) min = min.getTime();

            if(Number.isNaN(value) || Number.isNaN(min)) throw new Error("Invalid dates!");

            if(typeof value === "number" && typeof min === "number") return value >= min;

            if(!isValidDate_format(format)) throw new Error("Invalid format!");

            if(!Validator.isDate(value, format) || !Validator.isDate(min, format)) throw new Error("Invalid dates!");

            const dateObject = extractDate(value, format), minDateObj = extractDate(min, format);

            value = new Date(dateObject.year, dateObject.month - 1, dateObject.day).getTime();
            min   = new Date(minDateObj.year, minDateObj.month - 1, minDateObj.day).getTime();

            return value >= min;
        },

        isDateAtMost: (value, max, format = "DD/MM/YYYY") => {
            if(value instanceof Date) value = value.getTime();

            if(max instanceof Date) max = max.getTime();

            if(Number.isNaN(value) || Number.isNaN(max)) throw new Error("Invalid dates!");

            if(typeof value === "number" && typeof max === "number") return value <= max;

            if(!isValidDate_format(format)) throw new Error("Invalid format!");

            if(!Validator.isDate(value, format) || !Validator.isDate(max, format)) throw new Error("Invalid dates!");

            const dateObject = extractDate(value, format), maxDateObj = extractDate(max, format);

            value = new Date(dateObject.year, dateObject.month - 1, dateObject.day).getTime();
            max   = new Date(maxDateObj.year, maxDateObj.month - 1, maxDateObj.day).getTime();

            return value <= max;
        },

        isDateInRange: (value, min, max, format = "DD/MM/YYYY") => {
            if(value instanceof Date) value = value.getTime();

            if(min instanceof Date) min = min.getTime();

            if(max instanceof Date) max = max.getTime();

            if(Number.isNaN(value) || Number.isNaN(min) || Number.isNaN(max)) throw new Error("Invalid dates!");

            if(typeof value === "number" && typeof min === "number" && typeof max === "number") return value >= min && value <= max;

            if(!isValidDate_format(format)) throw new Error("Invalid format!");

            if(!Validator.isDate(value, format) || !Validator.isDate(min, format) || !Validator.isDate(max, format))
                throw new Error("Invalid dates!");

            const dateObject = extractDate(value, format), minDateObj = extractDate(min, format), maxDateObj = extractDate(max, format);

            value = new Date(dateObject.year, dateObject.month - 1, dateObject.day).getTime();
            min   = new Date(minDateObj.year, minDateObj.month - 1, minDateObj.day).getTime();
            max   = new Date(maxDateObj.year, maxDateObj.month - 1, maxDateObj.day).getTime();

            return value >= min && value <= max;
        },

        validate: (inputGroup, callback, messages = Validator.messages) => {
            if(!(inputGroup instanceof HTMLElement)) throw new Error("Feed valid input group!");

            if(inputGroup.closest("form")) inputGroup.closest("form").setAttribute("novalidate", "");

            const inputs = inputGroup.querySelectorAll("input[data-validate], select[data-validate]");

            console.log(inputs);
            
            
            let invalidInputsCount = 0;

            inputGroup.addEventListener("input", (event) => {
                const input = event.target.closest("input");
                
                if(Array.from(inputs).includes(input)) inputValidation(input, messages);
            });

            inputGroup.addEventListener("change", (event) => {
                const input = event.target.closest("select");
                
                if(Array.from(inputs).includes(input)) inputValidation(input, messages);
            });

            inputGroup.addEventListener("submit", (event) => {
                invalidInputsCount = 0;
                inputs.forEach(input => inputValidation(input, messages));

                if(invalidInputsCount !== 0) event.preventDefault();
            });

            function inputValidation(input, messages) {
                const value     = input.value.trim();
                const required  = input.required;
                let   type      = (supported_types.includes(input.type)) ? input.type      : "text";
                const step      = input.hasAttribute("step")             ? input.step      : "any";
                const min       = input.hasAttribute("min")              ? input.min       : null;
                const max       = input.hasAttribute("max")              ? input.max       : null;
                const minlength = input.hasAttribute("minlength")        ? input.minlength : null;
                const maxlength = input.hasAttribute("maxlength")        ? input.maxlength : null;
                const pattern   = input.hasAttribute("pattern")          ? input.pattern   : null;

                const validation_type = input.getAttribute("data-validate");

                if(validation_type.length > 0 && supported_types.includes(validation_type)) type = validation_type;

                const result = {
                    message: null,
                    valid  : false
                };

                if(required) {
                    if(Validator.isEmpty(value)) {
                        result.message = messages.required[0];
                        invalidInputsCount++;
                        return callback(input, result);
                    }

                    result.message = messages.required[1];
                }

                // if(type === "text" && value.length > 0) {
                    
                // }

                if(type === "password" && value.length > 0) {
                    let regex = undefined;

                    if(pattern) regex = new RegExp(`^${pattern}$`);

                    if(!Validator.isPassword(value, undefined, undefined, regex)) {
                        result.message = messages.password[0];
                        invalidInputsCount++;
                        return callback(input, result);
                    }

                    result.message = messages.password[1];
                }

                if(type === "email" && value.length > 0) {
                    if(!Validator.isEmail(value)) {
                        result.message = messages.email[0];
                        invalidInputsCount++;
                        return callback(input, result);
                    }

                    result.message = messages.email[1];
                }

                if(type === "number" && value.length > 0) {
                    let set = Validator.INTEGER;

                    if(!Validator.isNumber(step) && step !== "any") throw new Error("Invalid step value!");

                    if(!Validator.isNumber(step, Validator.INTEGER) && step !== "any") set = Validator.REAL;

                    if(!Validator.isNumber(value, set)) {
                        result.message = messages.number[0];
                        invalidInputsCount++;
                        return callback(input, result);
                    }

                    if(Validator.isNumber(step) && !Validator.isMultipleOf(value, step)) {
                        result.message = messages.number[0];
                        invalidInputsCount++;
                        return callback(input, result);
                    }

                    result.message = messages.number[1];
                }

                if(type === "tel" && value.length > 0) {
                    const telFormat = input.hasAttribute("data-format-tel") ? input.getAttribute("data-format-tel") : undefined;

                    if(!Validator.isTel(value, telFormat)) {
                        result.message = messages.tel[0];
                        invalidInputsCount++;
                        return callback(input, result);
                    }

                    result.message = messages.tel[1];
                }

                if(type === "url" && value.length > 0) {
                    if(!Validator.isURL(value)) {
                        result.message = messages.url[0];
                        invalidInputsCount++;
                        return callback(input, result);
                    }

                    result.message = messages.url[1];
                }

                if(type === "date" && value.length > 0) {
                    const date_format = input.hasAttribute("data-format-date") ? input.getAttribute("data-format-date") : undefined;

                    if(!Validator.isDate(value, date_format)) {
                        result.message = messages.date;
                        invalidInputsCount++;
                        return callback(input, result);
                    }

                    result.message = messages.date[1];

                    if(min && Validator.isDate(min, date_format) && !Validator.isDateAtLeast(value, min, date_format)) {
                        result.message = messages.min[0];
                        invalidInputsCount++;
                        return callback(input, result);
                    } else result.message = messages.min[1];

                    if(max && Validator.isDate(max, date_format) && !Validator.isDateAtMost(value, max, date_format)) {
                        result.message = messages.max[0];
                        invalidInputsCount++;
                        return callback(input, result);
                    } else result.message = messages.max[1];
                }

                if(min && value.length > 0 && min_max_types.includes(type)) {
                    if(!Validator.isAtLeast(value, min)) {
                        result.message = messages.min[0];
                        invalidInputsCount++;
                        return callback(input, result);
                    }

                    result.message = messages.min[1];
                }

                if(max && value.length > 0 && min_max_types.includes(type)) {
                    if(!Validator.isAtMost(value, max)) {
                        result.message = messages.max[0];
                        invalidInputsCount++;
                        return callback(input, result);
                    }

                    result.message = messages.max[1];
                }

                if(minlength && value.length > 0 && length_types.includes(type)) {
                    if(!Validator.isAtLeast(value.length, minlength)) {
                        result.message = messages.minlength[0];
                        invalidInputsCount++;
                        return callback(input, result);
                    }

                    result.message = messages.minlength[1];
                }

                if(maxlength && value.length > 0 && length_types.includes(type)) {
                    if(!Validator.isAtMost(value.length, minlength)) {
                        result.message = messages.maxlength[0];
                        invalidInputsCount++;
                        return callback(input, result);
                    }

                    result.message = messages.maxlength[1];
                }

                if(pattern && value.length > 0) {
                    regex = new RegExp(`^${pattern}$`);
                    
                    if(!regex.test(value)) {
                        result.message = messages.pattern[0];
                        invalidInputsCount++;
                        return callback(input, result);
                    }

                    result.message = messages.pattern[1];
                }

                result.valid = true;
                return callback(input, result);
            }
        },

        messages: {
            required: [
                "Requis!",
                "Champ obligatoire complété."
            ],
            text: [
                "Entrée invalide!",
                "Entrée valide."
            ],
            password: [
                "Mot de passe invalide!",
                "Mot de passe valide."
            ],
            email: [
                "E-mail invalide!",
                "E-mail valide."
            ],
            number: [
                "Numéro invalide!",
                "Numéro valide."
            ],
            tel: [
                "Numéro de téléphone invalide!",
                "Numéro de téléphone valide."
            ],
            url: [
                "URL invalide!",
                "URL valide."
            ],
            date: [
                "Date invalide!",
                "Date valide."
            ],
            min: [
                "Valeur inférieure au minimum!",
                "La valeur est dans la plage autorisée."
            ],
            max: [
                "Valeur maximale dépassée!",
                "La valeur est dans la plage autorisée."
            ],
            minlength: [
                "Trop court!",
                "Longueur minimale atteinte."
            ],
            maxlength: [
                "Trop long!",
                "Dans la longueur maximale."
            ],
            pattern: [
                "Format non correct!",
                "Format valide."
            ]
        }
    };
})();

if(typeof module !== "undefined" && module.exports)  module.exports = Validator;