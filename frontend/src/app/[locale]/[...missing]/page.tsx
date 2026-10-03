import { notFound } from "next/navigation";

// catches any address no route claims, so the 404 renders inside the [locale] layout
const MissingPage = () => notFound();

export default MissingPage;
