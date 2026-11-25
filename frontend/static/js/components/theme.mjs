import { Switcher } from './switcher.mjs';


const themeStorageKey = 'theme';


class Theme {
    constructor() {
        this.switch = new Switcher('input[name="theme-switch"]');
        this.switch.toggled = (state) => {
            this.select(state ? 'dark' : 'light');
        };

        this.system = window.matchMedia('(prefers-color-scheme: dark)');
        this.select(this.savedPreference());

        this.system.addEventListener('change', () => {
            if (!this.preference)
                this.select(null);
        });

        window.addEventListener('pageshow', (event) => {
            this.select(event.persisted ? this.savedPreference() : this.preference);
        });

        window.addEventListener('storage', (event) => {
            if (event.key !== themeStorageKey && event.key !== null) return;

            this.select(this.savedPreference());
        });
    }

    savedPreference() {
        try {
            const value = localStorage.getItem(themeStorageKey);
            return value === 'light' || value === 'dark' ? value : null;
        } catch {
            return this.preference ?? null;
        }
    }

    current() {
        return this.preference ?? (this.system.matches ? 'dark' : 'light');
    }

    select(preference) {
        this.preference = preference;

        const theme = this.current();
        document.documentElement.classList.toggle('dark', theme === 'dark');
        document.documentElement.style.colorScheme = theme;
        this.switch.setChecked(theme === 'dark');

        try {
            if (preference !== null && localStorage.getItem(themeStorageKey) !== preference)
                localStorage.setItem(themeStorageKey, preference);
        } catch {
            // The selected theme still works when storage is unavailable.
        }
    }

}


const theme = new Theme();
