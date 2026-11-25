let initialTheme;

try {
    initialTheme = localStorage.getItem('theme');
} catch {
    // Use the system theme when storage is unavailable.
}

if (initialTheme !== 'light' && initialTheme !== 'dark')
    initialTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

document.documentElement.classList.toggle('dark', initialTheme === 'dark');
document.documentElement.style.colorScheme = initialTheme;
