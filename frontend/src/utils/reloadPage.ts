// a wrapper so tests can mock it: jsdom does not implement real navigation
export function reloadPage(): void {
    window.location.reload();
}

// a full load, for a change the running app can't pick up on its own (the language)
export function loadPage(href: string): void {
    window.location.assign(href);
}
