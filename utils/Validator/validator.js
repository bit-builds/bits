const ValidatorMessages = {
    required  : ["Requis!"                               ,            "Champ obligatoire complété."],
    alpha     : ["Entrée invalide!"                      ,                         "Entrée valide."],
    alphanum  : ["Entrée invalide!"                      ,                         "Entrée valide."],
    specials  : ["Entrée invalide!"                      ,                         "Entrée valide."],
    password  : ["Mot de passe invalide!"                ,                   "Mot de passe valide."],
    email     : ["E-mail invalide!"                      ,                         "E-mail valide."],
    number    : ["Numéro invalide!"                      ,                         "Numéro valide."],
    tel       : ["Numéro de téléphone invalide!"         ,            "Numéro de téléphone valide."],
    url       : ["URL invalide!"                         ,                            "URL valide."],
    date      : ["Date invalide!"                        ,                           "Date valide."],
    color     : ["Couleur invalide!"                     ,                        "Couleur valide."],
    min       : ["Valeur inférieure au minimum!"         , "La valeur est dans la plage autorisée."],
    max       : ["Valeur maximale dépassée!"             , "La valeur est dans la plage autorisée."],
    step      : ["Valeur non valide."                    ,                        "Nombre accepté."],
    minlength : ["Trop court!"                           ,            "Longueur minimale atteinte."],
    maxlength : ["Trop long!"                            ,             "Dans la longueur maximale."],
    startdate : ["Date inférieure au minimum!"           ,   "La date est dans la plage autorisée."],
    enddate   : ["Date maximale dépassée!"               ,   "La date est dans la plage autorisée."],
    pattern   : ["Format non correct!"                   ,                         "Format valide."],
    equal     : ["Must be equal to other values!"        ,                      "Values are equal."],
    different : ["Must differ from other values!"        ,           "Different from other values."],
    greater   : ["Must be greater than other values!"    ,    "Value is greater than other values."],
    lesser    : ["Must be lesser than other values!"     ,    "Value is smaller than other values."],
    sum       : ["Somme invalide!"                       ,                          "Somme valide."]
};

const Validator = (() => {
    const BIGINT_REGEX = /^[\+-]?\d+n$/;

    const bindingsMap = new Map();

    const isDateFormat = (format) => {
        return new RegExp(`^(
            (D{1,2}[^0-9a-zA-Z]?M{1,2}[^0-9a-zA-Z]?Y{1,}) |
            (D{1,2}[^0-9a-zA-Z]?Y{1,}[^0-9a-zA-Z]?M{1,2}) |
            (M{1,2}[^0-9a-zA-Z]?D{1,2}[^0-9a-zA-Z]?Y{1,}) |
            (M{1,2}[^0-9a-zA-Z]?Y{1,}[^0-9a-zA-Z]?D{1,2}) |
            (Y{1,}[^0-9a-zA-Z]?D{1,2}[^0-9a-zA-Z]?M{1,2}) |
            (Y{1,}[^0-9a-zA-Z]?M{1,2}[^0-9a-zA-Z]?D{1,2})
        )$`.replace(/\s+/g, '')).test(format);
    };

    const extractDateComponents = (dateString, format) => {
        const FORMAT_REGEX = format.toLowerCase().replace(/y+|m+|d+/gi, match => {
            if (/y+/i.test(match)) return "(?<year>\\d{1,})";
            if (/m+/i.test(match)) return "(?<month>\\d{1,2})";
            if (/d+/i.test(match)) return "(?<day>\\d{1,2})";
        });

    const match = dateString.match(new RegExp(`^${FORMAT_REGEX}$`, "i"));
        if(!match) return null;
        return { 
            year  : parseInt(match.groups.year , 10),
            month : parseInt(match.groups.month, 10),
            day   : parseInt(match.groups.day  , 10)
        };
    };

    
    return {
        isEmpty: function(value) {
            if(Array.isArray(value) || typeof value === "string")
                return value.length === 0;

            if(value instanceof Map || value instanceof Set)
                return value.size === 0;

            if(typeof value === "object" && value !== null && value !== undefined)
                return Object.keys(value).length === 0;

            return value === null || value === undefined;
        },

        isInteger: function(value, signed) {
            if (typeof value === 'bigint' || typeof value === 'number') { 
                if(signed === false) return (Number.isInteger(value) && !isNaN(value)) && value >= 0;
                return Number.isInteger(value) && !isNaN(value);
            }

            const INTEGER_REGEX = new RegExp(`^([\\+${signed ? '-' : ''}]?\\d+([eE]\\+?\\d+)?|[\\+-]?\\d+n)$`);
            if (typeof value === 'string') return INTEGER_REGEX.test(value);

            return false;
        },

        isNumber: function(value, signed) {
            if (typeof value === 'bigint' || typeof value === 'number') { 
                if(signed === false) return !isNaN(value) && value >= 0;
                return !isNaN(value);
            }

            const NUMBER_REGEX = new RegExp(`^(([\\+${signed ? '-' : ''}]\\d\\.?|[\+${signed ? '-' : ''}]\\.\\d)?((\\d*(\\.\\d+)?)|(\\.d+))([eE][\\+-]?\\d+)?|[\\+-]?\\d+n)$`);
            if (typeof value === 'string') return NUMBER_REGEX.test(value); 

            return false;
        },

        isMultipleOf: function (value, factor) {
            if(!this.isNumber(value) || !this.isNumber(factor)) throw new Error('Value and factor arguments must be numerical values.');
            if(BIGINT_REGEX.test(value) || BIGINT_REGEX.test(factor)) return BigInt(value) % BigInt(factor) === 0;
            return (Number(value) % Number(factor)) === 0;
        },

        isBinary: function(value) {
            if(typeof value !== "string" && typeof value !== "number") return false;

            value = value.toString().toLowerCase();
            const BINARY_REGEX = /^[01]+$/;

            if(value.startsWith('0b')) value = value.slice(2);
            return BINARY_REGEX.test(value) && value.includes("1");
        },

        isOctal: function(value) {
            if(typeof value !== "string" && typeof value !== "number") return false;

            value = value.toString().toLowerCase();
            const OCTAL_REGEX = /^[0-7]+$/;

            if(value.startsWith("0o")) value = value.slice(2);
            return OCTAL_REGEX.test(value) && parseInt(value, 8) > 0;
        },

        isHex: function(value) {
            if(typeof value !== "string" && typeof value !== "number") return false;

            value = value.toString().toUpperCase();
            const HEXADECIMAL_REGEX = /^[0-9ABCDF]+$/;

            if(value.startsWith("0X")) value = value.slice(2);
            else if(value.startsWith("#")) value = value.slice(1);
            return HEXADECIMAL_REGEX.test(value) && parseInt(value, 16) > 0;
        },

        isAtLeast: function(value, min) {
            if(!this.isNumber(value) || !this.isNumber(min)) throw new Error('Min argument must be type of number or bigint.');
            if(BIGINT_REGEX.test(value) || BIGINT_REGEX.test(min) || typeof value === 'bigint' || typeof min === 'bigint') 
                return BigInt(value.toString().replace(/[nN]/, '')) >= BigInt(min.toString().replace(/[nN]/, ''));
            return Number(value) >= Number(min);
        },

        isAtMost: function(value, max) {
            if(!this.isNumber(value) || !this.isNumber(max)) throw new Error('Max argument must be type of number or bigint.');
            if(BIGINT_REGEX.test(value) || BIGINT_REGEX.test(max) || typeof value === 'bigint' || typeof max === 'bigint') 
                return BigInt(value.toString().replace(/[nN]/, '')) <= BigInt(max.toString().replace(/[nN]/, ''));
            return Number(value) <= Number(max);
        },

        isEmail: function(value) {
            if(typeof value !== "string") return false;
            return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value); // Basic email address regex.
        },

        isPassword: function(value, minlength = 1, maxlength = 64, regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])\S+$/) {
            minlength = Number(minlength);
            maxlength = Number(maxlength);

            if(Number.isNaN(minlength) || Number.isNaN(maxlength) || !Number.isInteger(minlength) || !Number.isInteger(maxlength) || minlength > maxlength)
                throw new Error("Length values must be valid integers, and the minimum value must not exceed the maximum!");

            return regex.test(value) && value.length >= minlength && value.length <= maxlength;
        },

        isAlpha: function(value) {
            if(typeof value !== "string") return false;
            return /^\p{L}+$/u.test(value);
        },

        isAlphanum: function(value) {
            if(typeof value !== "string") return false;
            return /^[\p{L}\p{N}]+$/u.test(value);
        },

        isSpecials: function(value) {
            if(typeof value !== "string") return false;
            return /^[^a-zA-Z0-9]+$/.test(value);
        },

        hasSpecials: function(value) {
            if(typeof value !== "string") return false;
            return /^[^\p{L}\p{N}]+$/u.test(value);
        },

        isTel: function(value, format = 'SSSSSSSSSS') {
            if (typeof format !== 'string') throw new Error('Format argument must be type of string.'); 
            if (typeof value  !== 'string') return false;

            // syntax ->  + C{1,3} N{1,5} S{1,10} alphanum E{1,5}    
            let FORMAT_REGEX = /^((\+)?([^a-zA-Z0-9]*)(C{0,3}))?([^a-zA-Z0-9]*)(N{0,5})?([^a-zA-Z0-9]*)(S{1,10})([^a-zA-Z0-9]*)(([a-z]|[^a-zA-Z0-9])*(E{1,5}))?$/;
            if (!FORMAT_REGEX.test(format)) throw new Error('Invalid format!');
        
            let pattern = '', i = 0;
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

        isURL: function(value, options) {
            let genDelims      = `[:\\/\\?\\#\\[\\]\\@]`;
            let subDelims      = `[\\*\\+,;=]`;
            let reserved       = `(${genDelims}|${subDelims})`;
            let unreserved     = `([a-zA-Z0-9\\-\\.\\_\\~])`;
            let pctEncoded     = `%[0-9a-fA-F]{2}`;
        
            let pchar          = `(${unreserved}|${pctEncoded}|${subDelims}|[:@])`;
            let fragment       = `(${pchar}|[\\/\\?])*`;
            let query          = `(${pchar}|[\\/\\?])*`;
        
            let segmentNZNC    = `(${unreserved}|${pctEncoded}|${subDelims}|@)+`;
            let segmentNZ      = `${pchar}+`;
            let segment        = `${pchar}*`;
        
            let pathEmpty      = ``;
            let pathRootless   = `${segmentNZ}(\\/${segment})*`;
            let pathNoscheme   = `${segmentNZNC}(\\/${segment})*`;
            let pathAbsolute   = `\\/((${segmentNZ}(\\/${segment})*)?)`;
            let pathAbempty    = `(\\/${segment})*`;
            let path           = `(${pathAbempty}|${pathAbsolute}|${pathNoscheme}|${pathRootless}|${pathEmpty})`;
        
            let regName        = `(${unreserved}|${pctEncoded}|${subDelims})*`;
            let decOctet       = `([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])`;
            let ipv4Adress     = `${decOctet}\\.${decOctet}\\.${decOctet}\\.${decOctet}`;
            let h16            = `[0-9a-fA-F]{1,4}`;
            let ls32           = `((${h16}:${h16})|${ipv4Adress})`;
        
            let ipv6Address    = `(
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
        
            let ipvFuture      = `v[0-9a-fA-F]+\\.(${unreserved}|${subDelims}|:)+`;
            let ipLiteral      = `\\[(${ipv6Address}|${ipvFuture})\\]`;
            let port           = `[0-9]*`;
            let host           = `(${ipLiteral}|${ipv4Adress}|${regName})`;
            let userInfo       = `(${unreserved}|${pctEncoded}|${subDelims}|:)*`;
            let authority      = `(${userInfo}@)?${host}(:${port})?`;
            let scheme         = `[a-zA-Z]([a-zA-Z0-9\\+\\-\\.]*)`;
        
            let relativePart   = `(\\/\\/${authority}${pathAbempty}|${pathAbsolute}|${pathNoscheme}|${pathEmpty})`;
            let hierPart       = `(\\/\\/${authority}${pathAbempty}|${pathAbsolute}|${pathRootless}|${pathEmpty})`;
            let relativeRef    = `${relativePart}(\\?${query})?(#${fragment})?`;
            let absoluteUri    = `${scheme}:${hierPart}(\\?${query})?`;
            let uri            = `${scheme}:${hierPart}(\\?${query})?(#${fragment})?`;
            let uriReference   = `(${uri}|${relativeRef})`;
        
            let isPath         = new RegExp('^' + path         + '$', 'g').test(value);
            let isRelativeRef  = new RegExp('^' + relativeRef  + '$', 'g').test(value);
            let isAbsoluteUri  = new RegExp('^' + absoluteUri  + '$', 'g').test(value);
            let isUriReference = new RegExp('^' + uriReference + '$', 'g').test(value);

            return isUriReference;
        },

        isDate: function(value, format = "DD/MM/YYYY") {
            if(value instanceof Date) return !Number.isNaN(value.getTime());
            if(!isDateFormat(format)) throw new Error("Format argument must be string with correct date placeholder formatting eg 'DD/MM/YYYY'");
            if(typeof value !== 'string') return false;

            let dateComponents = extractDateComponents(value, format);
            if(dateComponents === null) return false;

            const {day, month, year} = dateComponents;
            if(!day && !month && !year) return false;
            const monthsDays = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; /* Jan, Feb, Mars, ... Dec */
            monthsDays[2] = ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) ? 29 : 28; // Adjust month days
            if(day > monthsDays[month] || day < 1 || month > 12 || month < 1 || year === 0) return false; // when date is nonsense
            return true;
        },

        isDateAtLeast: function(value, min, format = "DD/MM/YYYY") {
            if(!isDateFormat(format)) throw new Error("Format argument must be string with correct date placeholder formatting eg, 'DD/MM/YYYY'");
            if(!(min   instanceof Date) && !this.isDate(min  , format)) throw new Error("Min argument must be either date object or string with given date format.");
            if(!(value instanceof Date) && !this.isDate(value, format)) return false;

            if(value instanceof Date) {
                value = value.getTime();
            }
            else {
                const dateComponents = extractDateComponents(value, format);
                value = new Date(dateComponents.year, dateComponents.month - 1, dateComponents.day).getTime();
            }

            if(min instanceof Date) {
                min = min.getTime();
            }
            else {
                const dateComponents = extractDateComponents(min, format);
                min = new Date(dateComponents.year, dateComponents.month - 1, dateComponents.day).getTime();
            }

            return value >= min;
        },

        isDateAtMost: function(value, max, format = "DD/MM/YYYY") {
            if(!isDateFormat(format)) throw new Error("Format argument must be string with correct date placeholder formatting eg, 'DD/MM/YYYY'.");
            if(!(max   instanceof Date) && !this.isDate(max  , format)) throw new Error("Max argument must be either date object or string with given date format.");
            if(!(value instanceof Date) && !this.isDate(value, format)) return false;

            if(value instanceof Date) {
                value = value.getTime();
            }
            else {
                const dateComponents = extractDateComponents(value, format);
                value = new Date(dateComponents.year, dateComponents.month - 1, dateComponents.day).getTime();
            }

            if(max instanceof Date) {
                max = min.getTime();
            }
            else {
                const dateComponents = extractDateComponents(max, format);
                max = new Date(dateComponents.year, dateComponents.month - 1, dateComponents.day).getTime();
            }

            return value <= max;
        },

        isColorNamed: function(value) {
            if(typeof value !== "string") return false;
            let style = new Option().style;
            style.color = value;
            return style.color !== '';
        },

        isColorHex: function(value) {
            if(typeof value !== "string") return false;
            return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(value);
        },

        validateInput: function(element, messages = ValidatorMessages, ignoreMessagesDiff = false) {
            if(!element.matches(`input[data-vld-type], select[data-vld-type], textarea[data-vld-type]`)) return;

            let input     = element;
            let value     = input.value;
            let rule      = input.dataset.vldType.trim().toLowerCase();
            let format    = input.dataset.vldFormat;
            let required  = input.dataset.vldRequired;
            let minlength = input.dataset.vldMinlength;
            let maxlength = input.dataset.vldMaxlength;
            let min       = input.dataset.vldMin;
            let max       = input.dataset.vldMax;
            let step      = input.dataset.vldStep;
            let startDate = input.dataset.vldStartdate;
            let endDate   = input.dataset.vldEnddate;
            let pattern   = input.dataset.vldPattern;
            let isValid   = true;
            
            if(ignoreMessagesDiff === false) {
                let validatorTypes = Object.keys(ValidatorMessages);
                for(let i = 0; i < validatorTypes.length; i++) {
                    let rule = validatorTypes[i];
                    if(messages[rule]) continue;
                    messages[rule] = ValidatorMessages[rule];
                }
            }

            if(!pattern && input.dataset.hasOwnProperty('vldErrmessage')) 
                throw new Error(``);
            if(!pattern && input.dataset.hasOwnProperty('vldMessage')) 
                throw new Error(``);
            if(rule === 'number' && (!Validator.isEmpty(minlength) || !Validator.isEmpty(maxlength))) 
                throw new Error(`Type attribute value 'number' must not be used with maxlength or minlength attributes.`);
            if(rule !== 'number' && (!Validator.isEmpty(min) || !Validator.isEmpty(max))) 
                throw new Error(`Type attribute value '${rule}' must not be used with max or min attributes.`);
            if(rule !== 'number' &&  !Validator.isEmpty(step)) 
                throw new Error(`Step attribute value must not be used along side '${rule}' validation attribute.`);
            if(rule !== 'date'   && (!Validator.isEmpty(startDate) || !Validator.isEmpty(endDate))) 
                throw new Error(`Type attribute value '${rule}' must not be used alongside startdate or enddate data attributes.`);
            if(!ValidatorMessages.hasOwnProperty(rule) && !Validator.isEmpty(rule)) 
                throw new Error('Unknown type attribute value was given.');


            if(!bindingsMap.has(input)) {
                const bindAttrRegex = /vldBind(\d+)/;
                for(let propName of Object.keys(input.dataset)) {
                    const index        = propName.match(bindAttrRegex)[1];
                    const hasBind      = bindAttrRegex.test(propName);
                    const hasOperation = input.dataset.hasOwnProperty('vldOperation' + index);

                    if(!hasBind     && !hasOperation) continue;
                    if(hasBind      && !hasOperation) throw new Error(``);
                    if(hasOperation && !hasBind)      throw new Error(``);

                    let operation = input.dataset['vldOperation' + index].trim().toLowerCase();
                    let targets   = input.dataset['vldBind' + index].replace(/\s+/g, '').split(',').map(id => document.querySelector(id));
                    bindingsMap.set(input, {operation, targets});
                }
            }


            if(rule === 'tel'  && typeof format !== 'string') format = 'SSSSSSSSSS';
            if(rule === 'date' && typeof format !== 'string') format = 'DD/MM/YYYY';
            required = input.hasAttribute('data-vld-required');
            minlength = !Validator.isNumber(minlength, false) ? -1 : Number(minlength);
            maxlength = !Validator.isNumber(maxlength, false) ? Infinity : Number(maxlength);
            if(minlength >= maxlength) 
                throw new Error('Minlength attribute value must not exceed Maxlength attribute value.');
            min = !Validator.isNumber(min, true) ? -Infinity : Number(min);
            max = !Validator.isNumber(max, true) ? Infinity  : Number(max);
            step = Number(step);
            if(min >= max) 
                throw new Error('Min attribute value must not exceed Max attribute value.');
            if(pattern && input.dataset.hasOwnProperty('vldErrmessage')) messages[rule][0] = input.dataset.vldErrmessage;
            if(pattern && input.dataset.hasOwnProperty('vldMessage')) messages[rule][1] = input.dataset.vldMessage;

            if     (rule ===    'alpha') isValid = Validator.isAlpha(value);
            else if(rule === 'alphanum') isValid = Validator.isAlphanum(value);
            else if(rule === 'specials') isValid = Validator.isSpecials(value);
            else if(rule ===   'number') isValid = Validator.isNumber(value, true);
            else if(rule ===    'email') isValid = Validator.isEmail(value);
            else if(rule === 'password') isValid = Validator.isPassword(value);
            else if(rule ===      'tel') isValid = Validator.isTel(value, format);
            else if(rule ===      'url') isValid = Validator.isURL(value);
            else if(rule ===     'date') isValid = Validator.isDate(value, format); 
            else if(rule ===  'pattern') isValid = new RegExp(pattern).test(value);

            if(isValid) { 
                if(required                            && isValid) { rule = 'required';  isValid = !Validator.isEmpty(value);                         }
                if(minlength  >  -1                    && isValid) { rule = 'minlength'; isValid = Validator.isAtLeast(value.length, minlength);      }
                if(maxlength !==  Infinity             && isValid) { rule = 'maxlength'; isValid = Validator.isAtMost(value.length, maxlength);       }
                if(min       !== -Infinity             && isValid) { rule = 'min';       isValid = Validator.isAtLeast(value, min)                    }
                if(max       !==  Infinity             && isValid) { rule = 'max';       isValid = Validator.isAtMost(value, max);                    }
                if(Validator.isNumber(step, true)      && isValid) { rule = 'step';      isValid = Validator.isMultipleOf (value, step);              }
                if(Validator.isDate(startDate, format) && isValid) { rule = 'startdate'; isValid = Validator.isDateAtLeast(value, startDate, format); }
                if(Validator.isDate(endDate  , format) && isValid) { rule = 'enddate';   isValid = Validator.isDateAtMost (value, endDate, format);   }
            }


            if(isValid && bindingsMap.has(input)) {
                let {operation, targets} = bindingsMap.get(input);

                if(operation === 'equal') {
                    for(let target of targets) {
                        if(input.value === target.value) continue;
                        rule    = operation;
                        isValid = false;
                    }
                }
                else if (operation === 'different') {
                    for(let target of targets) {
                        if(input.value !== target.value) continue;
                        rule    = operation;
                        isValid = false;
                    }
                }
                else if (operation === 'greater') {
                    for(let target of targets) {
                        if(Number(input.value) > Number(target.value)) continue;
                        rule    = operation;
                        isValid = false;
                    }
                }
                else if (operation === 'lesser') {
                    for(let target of targets) {
                        if(Number(input.value) < Number(target.value)) continue;
                        rule    = operation;
                        isValid = false;
                    }
                }
                else if (operation === 'sum') {
                    let accumilation = Number(input.value);
                    for(let target of targets) { 
                        if(!Validator.isNumber(target.value, true)) {
                            rule    = operation;
                            isValid = false;
                            break;
                        }
                        accumilation += Number(target.value); 
                    }
                    input.value = accumilation;
                }        
            }


            return {
                input   : input,
                isValid : isValid, 
                rule    : rule, 
                message : messages[rule][+isValid]
            };
        },

        validate: function(container, messages = ValidatorMessages, callback) {
            let validatorTypes = Object.keys(ValidatorMessages);
            for(let i = 0; i < validatorTypes.length; i++) {
                let rule = validatorTypes[i];
                if(messages[rule]) { 
                    if(!Array.isArray(messages[rule])) throw new Error(``);
                    if(messages[rule].length !== 2) throw new Error(``);
                    continue;
                }
                messages[rule] = ValidatorMessages[rule];
            }

            container.oninput = (event) => { 
                let result = validateInput(event.target, messages, true);
                result.errorCount = 1;
                if(!result) return;
                let input = result.input; delete result.input;
                callback(input, result);
            }

            container.onchange = (event) => { 
                let result = validateInput(event.target, messages, true);
                result.errorCount = 1;
                if(!result) return;
                let input = result.input; delete result.input; 
                callback(input, result);
            }

            if(!container.matches('form')) return;
            let inputs = container.querySelectorAll(`input[data-vld-type], select[data-vld-type], textarea[data-vld-type]`);
            container.onsubmit = (event) => {
                let canSubmit = true;
                let errorCount = 0;

                for(let input of inputs) { 
                    if(input.value.length === 0 && !input.matches('[data-vld-required]')) continue;
                    let result = validateInput(input, messages, true);
                    result.errorCount = ++errorCount;

                    if(!result) continue;
                    let target = result.input; delete result.input;
                    if(!result.isValid) canSubmit = false;
                    callback(target, result);
                }

                if(!canSubmit) { 
                    event.preventDefault(); 
                }
            }
        }
    }
})();