# PetCare Hub — Viva Notes

Short explanations for presenting the project. Veterinarian profiles, availability and the testimonial shown in the UI are explicitly demonstration data.

## 1. What is HTML5? Why use semantic HTML?

HTML5 is the markup standard used to structure a web page. Semantic elements such as `header`, `nav`, `main`, `section`, `article`, `form` and `footer` describe the purpose of content, improving accessibility, readability and search indexing.

## 2. What is CSS3?

CSS controls appearance and layout. A selector targets elements; the box model is content + padding + border + margin. Flexbox aligns items along one dimension, Grid handles rows and columns, and media queries adapt the design to screen width.

## 3. JavaScript essentials

- `const` declares a binding that will not be reassigned; `let` is for reassigned values.
- Functions package reusable behavior; arrays hold ordered values and objects group named properties.
- Events represent actions such as a button click or form submission.
- A Promise represents work that may finish later. `async`/`await` makes Promise-based code easier to follow.
- `fetch()` sends HTTP requests; this project uses it to call the Express API and reads JSON responses.

## 4. What is React?

React is a JavaScript library for building interfaces from reusable components. Pet cards, buttons, notices and pages can be composed and updated as application data changes.

## 5. Props versus state

Props are inputs passed from a parent component to a child. State is data owned by a component (or shared through context) that can change and trigger a re-render.

## 6. React hooks in this project

- `useState` keeps form values, filters, selected slots and loading/error states.
- `useEffect` loads API data when a page opens or when a relevant selection changes.
- `useContext` shares the current authenticated user and sign-in actions across routes.

## 7. What is Node.js?

Node.js runs JavaScript outside the browser. Here it runs the API server, database logic and development scripts.

## 8. What is Express and middleware?

Express is a Node.js web framework for defining routes and HTTP responses. Middleware runs during request handling; PetCare Hub uses it for JSON parsing, cookies, CORS, authentication, role checks and centralized errors.

## 9. REST APIs and HTTP methods

REST exposes resources through URLs. `GET` reads, `POST` creates, `PATCH` updates, and `DELETE` removes. For example, `POST /api/v1/pets` creates a pet and `PATCH /api/v1/appointments/:id/cancel` cancels an eligible visit.

## 10. MongoDB, documents and CRUD

MongoDB stores flexible BSON documents inside collections. CRUD means Create, Read, Update and Delete. This app persists users, pets, veterinarians, appointments and slot reservations in MongoDB collections.

## 11. Mongoose schemas and models

A Mongoose schema describes a document's fields, types, validation and indexes. A model provides methods for querying and changing a collection using that schema.

## 12. Frontend versus backend validation

Frontend validation improves usability (required fields, input types and immediate feedback). Backend validation is authoritative because requests can bypass the UI; the API checks ownership, valid IDs, allowed values, date/time, and appointment state before changing data.

## 13. Authentication versus authorization

Authentication answers “Who signed in?” Authorization answers “What is this user allowed to do?” PetCare Hub authenticates a JWT cookie and separately restricts admin routes by role and pet operations by ownership.

## 14. Password hashing and JWT cookies

Passwords are hashed with bcrypt; the original password is not stored. After sign-in, the API issues a signed JWT in an HTTP-only cookie so browser JavaScript cannot read the token. The frontend does not save credentials in localStorage.

## 15. What happens during appointment booking?

1. React loads the owner's pets and active veterinarians from the API.
2. The selected veterinarian and date are sent to the slots endpoint.
3. React submits pet, veterinarian, service, date, time and reason to Express.
4. Express authenticates the cookie, verifies pet ownership and schedule availability.
5. MongoDB atomically claims the unique veterinarian/date/time reservation key.
6. The API creates the appointment and returns its booking reference; React shows that API response.

## 16. How is double booking prevented?

The UI's availability list is only a convenience. The backend checks it again and inserts a `SlotReservation`. MongoDB enforces a unique compound index on veterinarian, date and start time, so two simultaneous requests cannot both claim the same slot. A duplicate-key response becomes HTTP 409. Cancelling removes the corresponding reservation so the slot can be booked again.

## 17. How does this demonstrate Web Technology?

The project combines semantic HTML/JSX, CSS3 responsive layout, ES6 JavaScript, React state/hooks/routing, Fetch API, Node.js, Express middleware, REST/JSON, MongoDB documents, Mongoose validation, authentication, authorization and CRUD workflows in one connected application.
