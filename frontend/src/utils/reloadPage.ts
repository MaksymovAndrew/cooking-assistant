// thin wrapper around window.location.reload so callers are easy to mock in tests (jsdom does not implement real navigation)
export function reloadPage(): void {
    window.location.reload();
}
