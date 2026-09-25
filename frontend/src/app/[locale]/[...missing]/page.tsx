import { notFound } from "next/navigation";

// the layout sits in a dynamic segment, so an address no route claims is caught here to render the
// app's own 404 inside it
const MissingPage = () => notFound();

export default MissingPage;
