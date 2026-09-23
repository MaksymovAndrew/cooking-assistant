// a path segment is any string: an id the API would reject as malformed is simply a record that
// does not exist, so the page answers 404 instead of failing the fetch and answering 500
export const isRecordId = (id: string): boolean => /^[1-9]\d*$/.test(id);
