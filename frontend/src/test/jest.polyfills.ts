// react-router v7 reads TextEncoder/TextDecoder at module load; jsdom has neither
import { TextDecoder, TextEncoder } from "node:util";

Object.assign(globalThis, { TextEncoder, TextDecoder });
