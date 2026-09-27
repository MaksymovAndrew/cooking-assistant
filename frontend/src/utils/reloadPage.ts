// thin wrapper around window.location.reload so callers are easy to mock in tests (jsdom does not implement real navigation)
export function reloadPage(): void {
    window.location.reload();
}

// a full load of another address, for a change the running app can't pick up on its own (the language)
export function loadPage(href: string): void {
    window.location.assign(href);
}
