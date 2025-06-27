const monthOffsetTable = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4]; // Month offset table
const FORMAT_REGEX = /^((D{1,2}[^0-9a-zA-Z]?M{1,2}[^0-9a-zA-Z]?Y{1,})|(D{1,2}[^0-9a-zA-Z]?Y{1,}[^0-9a-zA-Z]?M{1,2})|(M{1,2}[^0-9a-zA-Z]?D{1,2}[^0-9a-zA-Z]?Y{1,})|(M{1,2}[^0-9a-zA-Z]?Y{1,}[^0-9a-zA-Z]?D{1,2})|(Y{1,}[^0-9a-zA-Z]?D{1,2}[^0-9a-zA-Z]?M{1,2})|(Y{1,}[^0-9a-zA-Z]?M{1,2}[^0-9a-zA-Z]?D{1,2}))$/;

class Calendar {

    day = 1; month = 1; year = 1970; monthStart = 4;

    today = {
        day: 1,
        month: 1,
        year: 1970,
        monthStart: 4
    };

    monthsDays = [
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

    yearMonths = [
        '',
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'Septembre',
        'Octobre',
        'Novembre',
        'Decembre'
    ];

    weekDays = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday'
    ];

    regex = null;
    
    root = null; input = null;

    constructor(format = 'DD-MM-YYYY', input = null) {
        if(!this.isValidFormat(format)) throw Error('Invalid format!');
        this.format = format;

        let inputs = (input !== null) ? [input] : Array.from(document.querySelectorAll('input[data-calendar]:not([readonly]):not([disabled])'));
        this.input = inputs[0];

        if(!this.input) return;
        
        const calendarInputs = document.querySelectorAll('input[data-calendar]');
        calendarInputs.forEach(input => {
            input.setAttribute('type', 'text');
            input.placeholder = this.format;
        });

        const FORMAT_PATTERN = this.format.toLowerCase()
                .replace(/y+|m+|d+/gi, 
                    match => {
                        if (/y+/i.test(match)) return '(?<year>\\d{1,})';
                        if (/m+/i.test(match)) return '(?<month>\\d{1,2})';
                        if (/d+/i.test(match)) return '(?<day>\\d{1,2})';
                    }
        );
        this.regex = new RegExp(`^${FORMAT_PATTERN}$`, 'i');

        this.initialDate();
        
        this.render();

        document.body.addEventListener('click', (event) => {
            if(inputs.includes(event.target)) {
                this.input = event.target;
                if(this.input.value) {
                    let date = this.extractDate(this.input.value);
                    this.day = date.day;
                    this.month = date.month;
                    this.year = date.year;
                    this.updateDaysGridView(true);
                }
                this.updateRootPosition();
                this.root.style.display = 'flex';
            } else if(!this.root.contains(event.target)) this.root.style.display = 'none';
        });

        document.body.addEventListener('input', debounce((event) => {
            if(inputs.includes(event.target)) {
                try { this.setInputDate(event.target.value); }
                catch(e) {
                    event.target.value = this.formatDate(this.format);
                }
            }
        }));

        const resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                this.root.style.display = 'none';
                this.updateRootPosition();
            }
        });
        resizeObserver.observe(document.body);

        calendarInputs.forEach(input => {
            const observer = new MutationObserver(() => {
                if(input.disabled) inputs = inputs.filter((element) => input != element);
                else inputs.push(input);
            });

            observer.observe(input, { attributes: true });
        });
    }

    isValidFormat(format) {
        return FORMAT_REGEX.test(format);
    }

    isLeapYear(year = 1) {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    }

    leapYearAdjustment(year) {
        if(this.isLeapYear(year)) this.monthsDays[2] = 29;
        else this.monthsDays[2] = 28;
    }

    initialDate() {
        let dateInstance = new Date();
        this.day = dateInstance.getDate();
        this.month = dateInstance.getMonth() + 1;
        this.year = dateInstance.getFullYear();
        this.monthStart = this.dayOfWeek(this.year, this.month);

        this.today.day = this.day;
        this.today.month = this.month;
        this.today.year = this.year;
        this.today.monthStart = this.dayOfWeek(this.year, this.month);

        this.isLeapYear(this.year);
    }

    formatDate(format) {
        let formattedDate = format;
        formattedDate = formattedDate.replace(/D+/g, (match) => {
            return this.day.toString().slice(-match.length).padStart(match.length, '0');
        });
        formattedDate = formattedDate.replace(/M+/g, (match) => {
            return this.month.toString().slice(-match.length).padStart(match.length, '0');
        });
        formattedDate = formattedDate.replace(/Y+/g, (match) => {
            return this.year.toString().slice(-match.length).padStart(match.length, '0');
        });
        return formattedDate;
    }

    extractDate(dateString) {
        const match = dateString.match(this.regex);

        if (!match) return null;

        return {
            year: parseInt(match.groups.year),
            month: parseInt(match.groups.month),
            day: parseInt(match.groups.day)
        };
    }

    setInputDate(dateString) {
        let date = this.extractDate(dateString);

        if(date === null) throw Error('Invalid date!');

        if(date.day > this.monthsDays[date.month] 
            || date.year < 1583 
            || date.month > 12 || date.month < 1
        ) throw Error('Invalid date!');

        this.day = date.day;
        this.month = date.month;
        this.year = date.year;
        this.updateDaysGridView(true);
    }

    // Tomohiko Sakamoto’s Algorithm
    dayOfWeek(year, month) {
        const day = 1;
        if (month < 3) year -= 1;
        return parseInt((year + year/4 - year/100 + year/400 + monthOffsetTable[month-1] + day) % 7);
    }

    render() {
        let template = document.createElement('template');
        this.rootStyle();
        template.innerHTML = this.rootHtml();
        this.root = template.content.cloneNode(true).firstElementChild;
        let previous = this.root.querySelector('.calendar-previous');
        let next = this.root.querySelector('.calendar-next');
        let daysGridView = this.root.querySelector('.calendar-daysGridView');
        let clear = this.root.querySelector('.calendar-clear');
        let reset = this.root.querySelector('.calendar-reset');

        daysGridView.addEventListener('click', (event) => {
            if(event.target.tagName.toLowerCase() === 'button') {
                let button = event.target;
                let previouslyActive = daysGridView.querySelector('.active');
                if(previouslyActive !== null) previouslyActive.classList.remove('active');
                button.classList.add('active');
                this.day = parseInt(button.textContent);
                this.input.value = this.formatDate(this.format);
                this.root.style.display = 'none';

                this.input.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });

        previous.addEventListener('click', () => {
            this.month--;
            if(this.month <= 0) {
                this.year--;
                this.month = 12;
                this.leapYearAdjustment(this.year);
            }
            if(this.day > this.monthsDays[this.month]) this.day = this.monthsDays[this.month];
            this.input.value = this.formatDate(this.format);
            this.updateDaysGridView(true);

            this.input.dispatchEvent(new Event('change', { bubbles: true }));
        });

        next.addEventListener('click', () => {
            this.month++;
            if(this.month > 12) {
                this.year++;
                this.month = 1;
                this.leapYearAdjustment(this.year);
            }
            if(this.day > this.monthsDays[this.month]) this.day = this.monthsDays[this.month];
            this.input.value = this.formatDate(this.format);
            this.updateDaysGridView(true);

            this.input.dispatchEvent(new Event('change', { bubbles: true }));
        });

        clear.addEventListener('click', () => {
            this.input.value = '';
            this.input.placeholder = this.format;
            this.day = this.today.day;
            this.month = this.today.month;
            this.year = this.today.year;
            this.updateDaysGridView(true);
            this.root.style.display = 'none';

            this.input.dispatchEvent(new Event('change', { bubbles: true }));
        });

        reset.addEventListener('click', () => {
            this.day = this.today.day;
            this.month = this.today.month;
            this.year = this.today.year;
            this.input.value = this.formatDate(this.format);
            this.updateDaysGridView(true);
            this.root.style.display = 'none';

            this.input.dispatchEvent(new Event('change', { bubbles: true }));
        });

        this.updateRootPosition();
        document.body.appendChild(this.root);
        this.updateDaysGridView(true);
    }

    updateDaysGridView(newMonth = false) {
        let partialDateLabel = this.root.querySelector('.calendar-partialDate');
        let daysGridView = this.root.querySelector('.calendar-daysGridView');
        let buttons = daysGridView.querySelectorAll('button');
        
        if(newMonth === true) {
            let weekDayControllers = document.querySelectorAll('.week-day-controller');
            let currentMonthStart = this.dayOfWeek(this.year, this.month);
            for(let i = 0; i < weekDayControllers.length; i++) {
                if(i < currentMonthStart) weekDayControllers[i].style.display = 'inline';
                else weekDayControllers[i].style.display = 'none';
            }
        } 

        for(let i = 0; i < buttons.length; i++) {
            let button = buttons[i];
            let day = parseInt(button.textContent, 10);
            
            if(day === this.day) {
                let previouslyActive = this.root.querySelector('.active');
                if(previouslyActive !== null) previouslyActive.classList.remove('active');
                button.classList.add('active'); 
            }

            button.style.display = (day > this.monthsDays[this.month]) ? 'none' : '';
        }

        partialDateLabel.textContent = this.yearMonths[this.month] + ', ' + this.year;
        this.root.style.zIndex = this.input.zIndex + 1;
    }

    updateRootPosition() {
        let inputRect = this.input.getBoundingClientRect();
        this.root.style.display = 'flex';
        let rootWidth = this.root.getBoundingClientRect().width;
        let rootHeight = this.root.getBoundingClientRect().height;
        this.root.style.display = 'none';
        let inputX = window.scrollX + inputRect.x;
        let inputY = window.scrollY + inputRect.y + inputRect.height;
        
        if (inputX + rootWidth > document.body.scrollWidth) {
            inputX = document.body.scrollWidth + window.scrollX - rootWidth;
        }

        if (inputY + rootHeight > document.body.scrollHeight) {
            inputY = inputY - rootHeight - inputRect.height;
        }

        this.root.style.left = inputX + 'px';
        this.root.style.top = inputY + 'px';
    }

    rootStyle() {
        if(document.getElementById('calendarStyle') === null) {
            let style = document.createElement('style');
            style.setAttribute('id', 'calendarStyle');
            style.innerHTML = `
                .calendar { z-index: 99999; }

                .calendar * {
                    margin: 0;
                    outline: 0;
                    border: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                .calendar button {
                    cursor: pointer;
                }

                .calendar button:hover { 
                    opacity: 0.75; 
                }

                .calendar button:focus { 
                    opacity: 0.5;  
                }

                .calendar {
                    --white: #FFFFFF;
                    --cloudGrey: #BFBFBF;
                    --grey: #7F7F7F;
                    --black: #000000;
                    --blue: #0000EE;

                    position: absolute;
                    border: 1px solid var(--cloudGrey);
                    padding: 1em;
                    display: none;
                    gap: 0.5em;
                    flex-direction: column;
                    font-family: Arial, Helvetica, sans-serif;
                    background-color: var(--white);
                    color: var(--black);
                }

                .calendar-header, 
                .calendar-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: baseline;
                }

                .calendar-partialDate {
                    font-weight: bold;
                }

                .calendar-nav {
                    display: flex;
                    justify-content: stretch;
                    align-items: baseline;
                    gap: 0.25em;
                }

                .calendar-nav > button {
                    padding: 0.25em;
                    background-color: transparent;
                    cursor: pointer;
                }

                .calendar-daysGridView {
                    display: grid;
                    grid-template-columns: repeat(7, max-content);
                    grid-template-rows: auto;
                    gap: 0.25em;
                    text-align: center;
                }

                .calendar-daysGridView > button,
                .calendar-footer > label {
                    padding: 0.25em;
                }

                .calendar-daysGridView > label {
                    font-size: 0.75rem;
                    color: #888;
                    font-weight: normal;
                }

                .calendar-footer > button {
                    padding: 0.25em 0.5em;
                    background-color: transparent;
                    color: var(--blue);
                    font-size: 0.75rem;
                } 

                .calendar .active,
                .calendar .active:hover,
                .calendar .active:focus {
                    border: 0.1rem solid var(--black);
                    background-color: var(--grey);
                    color: var(--white);
                    opacity: 1;
                    cursor: default;
                }
            `;

            let refElement = document.body.firstElementChild;
            if(refElement === null) document.body.appendChild(style);
            else refElement.insertAdjacentElement('beforebegin', style);
        }
    }

    rootHtml() {
        return `
            <div class='calendar'>
                <header class='calendar-header'>
                    <label class='calendar-partialDate'></label>
                    <nav class='calendar-nav'>
                        <button class='calendar-previous'>
                            <svg width="1rem" height="1rem" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10 5 L3 15 H17 Z" fill="#7F7F7F"/>
                            </svg>
                        </button>
                        <button class='calendar-next'>
                            <svg width="1rem" height="1rem" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10 15 L3 5 H17 Z" fill="#7F7F7F"/>
                            </svg>
                        </button>
                    </nav>
                </header>
                <div class='calendar-daysGridView'>
                    ${(() => {
                        let html = ``;
                        for(let i = 0; i < this.weekDays.length; i++) html += `<label>${this.weekDays[i].slice(0, 3)}</label>`
                        for(let i = 0; i < 7; i++) html += `<label class="week-day-controller" style="visibility: hidden;">0</label>`;
                        for(let i = 1; i < 32; i++) html += `<button>${i}</button>`;
                        return html;
                    })()}
                </div>
                <div class='calendar-footer'>
                    <button class='calendar-clear'>Réinitialiser</button>
                    <button class='calendar-reset'>Aujourd’hui</button>
                </div>
            </div>
        `;
    }

}