// a malformed id is a record that doesn't exist: answer 404, not a failed fetch's 500
export const isRecordId = (id: string): boolean => /^[1-9]\d*$/.test(id);
