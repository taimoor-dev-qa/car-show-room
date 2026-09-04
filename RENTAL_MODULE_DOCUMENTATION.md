# CarZone Rental Module Documentation

## 1. Overview

The Car Rental module maintains rental-car listings separately from cars for sale. On the buyer side, it provides a public catalogue of active rental vehicles, filters by city, category, and daily-price range, and a detail page that shows vehicle, availability, pickup, driver, image, and seller information. On the seller side, authenticated sellers can create, view, edit, and delete only their own rental listings, including image uploads and listing status. The current interface explicitly states that booking requests will be introduced in a later phase.

## 2. Backend Structure

### Rental-specific and shared backend files

| Path | Purpose | Exports / relevant contents |
| --- | --- | --- |
| `backend/models/RentalCar.js` | Defines and exports the MongoDB/Mongoose schema for a rental listing. | Default export: `mongoose.model('RentalCar', rentalCarSchema)`. The schema fields are documented in [Data Model](#4-data-model). |
| `backend/controllers/rentalCarController.js` | Implements rental-listing creation, buyer catalogue retrieval, seller retrieval, detail retrieval, update, deletion, selective body-field copying, and availability validation. | Exported controller functions: `createRental`, `getRentals`, `getMyRentals`, `getRentalById`, `updateRental`, `deleteRental`. Internal helpers: `getRentalData(body)` and `hasInvalidAvailability(rental)`. |
| `backend/routes/rentalRoutes.js` | Maps `/api/rentals` HTTP routes to rental controller functions and attaches middleware where needed. | Default export: Express `router`. |
| `backend/middleware/authMiddleware.js` | Shared protection used by seller-only rental-management endpoints. It reads a Bearer JWT, verifies it, and places decoded `{ id, role }` data on `req.user`; it also enforces seller role. | Named exports: `protect`, `sellerOnly`. |
| `backend/middleware/uploadMiddleware.js` | Shared Multer configuration used for rental image uploads. Stores uploads in `uploads/`, permits JPEG, PNG, and WEBP, and limits individual files to 5 MB. | Default export: configured `upload` Multer instance. Rental routes use `upload.array('images', 10)`. |
| `backend/server.js` | Creates the Express application, makes the `uploads/` directory publicly available, and mounts the rental router at `/api/rentals`. | Starts the HTTP/Socket.IO server; registers `app.use('/uploads', express.static('uploads'))` and `app.use('/api/rentals', rentalRoutes)`. |
| `backend/models/user.js` | Shared user schema referenced by `RentalCar.seller`. Rental list and detail reads populate a seller's `name` and `businessName`. | Default export: `mongoose.model('User', userSchema)`. Its rental-relevant fields are `name`, `role`, and `businessName`; the model also supplies the referenced user `_id`. |
| `backend/seedRentals.js` | Standalone seed script that inserts twelve active sample `RentalCar` documents for the first seller it finds. | No module exports; calls `runSeed()` immediately. |

### Rental API endpoints

All paths below include the backend registration prefix `/api/rentals`. Successful rental objects are Mongoose documents serialized as JSON, including schema fields and Mongoose `_id`, `createdAt`, and `updatedAt`. Where seller data is populated, `seller` is an object containing `_id`, `name`, and `businessName`; on unpopulated seller-owned reads, it remains the seller ObjectId.

| Method and path | What it does | Protection | Input | Success response | Observed error response |
| --- | --- | --- | --- | --- | --- |
| `GET /api/rentals` | Returns buyer-visible rental listings. The controller always restricts this query to `status: 'active'`. | None. | Optional query parameters: `city` (case-insensitive partial match), `category` (exact match; `All` is ignored), `minPrice`, `maxPrice` (numeric daily-rate limits), and `driverAvailable` (`true` or `false`). | `200 OK` with `RentalCar[]`, each with populated seller `name` and `businessName`. | `500` with `{ "message": "<error message>" }`. |
| `GET /api/rentals/mine` | Returns all rental listings belonging to the authenticated seller, newest first. | `protect`, then `sellerOnly`. | Bearer token; no body or parameters. | `200 OK` with `RentalCar[]`, sorted by `createdAt` descending. | `401` `{ "message": "Not authorized, no token" }` or `{ "message": "Not authorized, token invalid" }`; `403` `{ "message": "Only sellers can do this" }`; or `500` message object. |
| `GET /api/rentals/:id` | Retrieves one rental listing by MongoDB ID for the buyer detail page or seller edit load. | None. | Path parameter: `id`. | `200 OK` with one `RentalCar`, with populated seller `name` and `businessName`. | `404` `{ "message": "Rental car not found" }`, or `500` message object. |
| `POST /api/rentals` | Creates a rental listing owned by the authenticated seller. | `protect`, `sellerOnly`, `upload.array('images', 10)`. | Bearer token; `multipart/form-data`. Accepted listing fields are `makeModel`, `variant`, `year`, `category`, `transmission`, `fuelType`, `seats`, `mileage`, `description`, `dailyRate`, `city`, `pickupArea`, `availableFrom`, `availableUntil`, `driverAvailable`, `driverCharges`, `minRentalDays`, `maxRentalDays`, and `status`. Optional image files use field name `images`, maximum 10. The controller sets `seller` from the token and derives `images` from uploaded filenames. | `201 Created` with the created `RentalCar`. | `400` `{ "message": "Check availability dates and rental-day limits" }` when start date is later than end date or minimum days exceed maximum days; otherwise `500` message object. |
| `PUT /api/rentals/:id` | Updates an existing rental listing only when its `seller` matches the authenticated seller. New uploaded images replace the listing's image filename array; if no image files are supplied, existing images remain. | `protect`, `sellerOnly`, `upload.array('images', 10)`, plus controller ownership check. | Bearer token; path parameter `id`; `multipart/form-data` using the same accepted fields and optional `images` upload field as `POST`. Only fields included in the request body are assigned. | `200 OK` with updated `RentalCar`. | `401`/`403` middleware responses above; `404` `{ "message": "Rental car not found" }`; ownership `403` `{ "message": "Not your rental listing" }`; invalid range `400` validation message; or `500` message object. |
| `DELETE /api/rentals/:id` | Deletes an existing rental listing only when it belongs to the authenticated seller. | `protect`, `sellerOnly`, plus controller ownership check. | Bearer token; path parameter `id`; no body. | `200 OK` with `{ "message": "Rental listing deleted" }`. | `401`/`403` middleware responses above; `404` not-found message; ownership `403` not-your-listing message; or `500` message object. |

`getRentalData` deliberately accepts only the fields listed for the create/update request bodies; `seller` and `images` are not copied from request body data. `hasInvalidAvailability` checks that `availableFrom` is not later than `availableUntil`, and that `minRentalDays` is not greater than `maxRentalDays`.

## 3. Frontend Structure

### Rental-specific pages and supporting frontend files

| Path | Description |
| --- | --- |
| `frontend/src/pages/buyer/CarsForRent.jsx` | Buyer rental catalogue. On initial render and filter submission, sends `GET /rentals`; renders a city/category/min-price/max-price filter form, loading/count/empty states, active rental cards, rate, selected vehicle details, driver availability, and detail-page links. Its header links to the sale catalogue, rental catalogue, chats, and login/logout state. |
| `frontend/src/pages/buyer/RentalCarDetail.jsx` | Buyer rental-detail page. Reads `id` from the URL, requests `GET /rentals/:id`, supports selecting among images, and renders the car's core attributes, daily rate, pickup location, availability window, rental-day limits, driver information, seller name/business name, and description. It has a back link to the catalogue and displays the later-phase booking note. |
| `frontend/src/pages/seller/MyRentalCars.jsx` | Seller rental-management list. Redirects non-sellers to `/seller/login`, loads `GET /rentals/mine`, displays each rental in a table, navigates to add/edit form, and asks for browser confirmation before calling `DELETE /rentals/:id`. |
| `frontend/src/pages/seller/AddRentalCar.jsx` | Combined seller create/edit form. Redirects non-sellers to `/seller/login`; `?edit=<id>` loads `GET /rentals/:id` and uses `PUT /rentals/:id`, while create mode uses `POST /rentals`. It sends `FormData`, supports up to ten images, and reports API errors. Create mode submits fixed values for daily rate, city, pickup area, driver options, and rental-day limits; edit mode exposes those inputs. Local helper components: `Field` and `Select`; helper functions: `initialForm` and `dateValue`. |
| `frontend/src/styles/10-rental.css` | Rental-specific presentation for buyer filters/cards/rate labels, seller form controls and status pills, detail layout, booking-phase note, and responsive layouts. |
| `frontend/src/styles/01-base-header.css` | Shared buyer header/navigation styling imported by `CarsForRent.jsx`. |
| `frontend/src/styles/04-car-card.css` | Shared listing-card, grid, image, and empty-state styling imported by `CarsForRent.jsx`. |
| `frontend/src/styles/07-car-detail.css` | Shared detail-page, image gallery, metadata, seller strip, and loading styling imported by `RentalCarDetail.jsx`. |
| `frontend/src/styles/seller-style.css` | Shared seller-panel layout, sidebar, table, headers, buttons, form-group, and status-pill styling imported by both seller rental pages. |
| `frontend/src/api/axios.js` | Shared Axios client used by all four rental pages. Its base URL is `http://localhost:3500/api`, so calls such as `/rentals` resolve to `/api/rentals`; it automatically sends a stored `token` as a Bearer Authorization header. |
| `frontend/src/App.jsx` | Imports and registers all four rental page components with React Router. |

There is no separate reusable rental component directory or rental-specific frontend asset file in the inspected source. The `Field`, `Select`, and `Spec` helpers are defined within their respective page files.

### Registered frontend routes

| Route | Component |
| --- | --- |
| `/cars-for-rent` | `CarsForRent` |
| `/rental/:id` | `RentalCarDetail` |
| `/seller/rental-cars` | `MyRentalCars` |
| `/seller/rental-cars/add` | `AddRentalCar` (also acts as edit view when given `?edit=<rentalId>`) |

### Navigation links into the module

| Source file | Link label / destination |
| --- | --- |
| `frontend/src/pages/buyer/Home.jsx` | Buyer header: `Cars for Rent` -> `/cars-for-rent`. |
| `frontend/src/pages/buyer/CarsForRent.jsx` | Buyer header: active `Cars for Rent` -> `/cars-for-rent`; each rental card: `View Rental Details` -> `/rental/:id`. |
| `frontend/src/pages/buyer/RentalCarDetail.jsx` | Detail-page back link: `Back to rentals` -> `/cars-for-rent`. |
| `frontend/src/pages/seller/Dashboard.jsx` | Seller sidebar: `Rental Cars` -> `/seller/rental-cars`. |
| `frontend/src/pages/seller/Profile.jsx` | Seller sidebar: `Rental Cars` -> `/seller/rental-cars`. |
| `frontend/src/pages/seller/Inquiries.jsx` | Seller sidebar: `Rental Cars` -> `/seller/rental-cars`. |
| `frontend/src/pages/seller/Chat.jsx` | Seller sidebar: `Rental Cars` -> `/seller/rental-cars`. |
| `frontend/src/pages/seller/MyRentalCars.jsx` | Seller sidebar: active `Rental Cars` -> `/seller/rental-cars`; add button: `+ Add Rental Car` -> `/seller/rental-cars/add`; edit action navigates to `/seller/rental-cars/add?edit=:id`. |
| `frontend/src/pages/seller/AddRentalCar.jsx` | Seller sidebar: active `Rental Cars` -> `/seller/rental-cars`. |

## 4. Data Model

### `RentalCar` (`backend/models/RentalCar.js`)

| Field | Type / constraints | Purpose |
| --- | --- | --- |
| `seller` | `ObjectId`, ref `User`, required | Owner/provider of the rental listing. Set from the authenticated seller on creation. |
| `makeModel` | `String`, required, trimmed | Vehicle make and model. |
| `variant` | `String`, trimmed | Optional vehicle variant/trim. |
| `year` | `Number`, required | Vehicle model year. |
| `category` | `String`, required, trimmed | Vehicle class, such as Sedan or SUV. |
| `transmission` | `String`, required, trimmed | Transmission description. |
| `fuelType` | `String`, required, trimmed | Fuel type. |
| `seats` | `Number`, required | Number of seats. |
| `mileage` | `Number`, required | Vehicle mileage, displayed in kilometres. |
| `description` | `String`, trimmed | Optional seller description. |
| `dailyRate` | `Number`, default `2000`, minimum `0` | Rental price per day. |
| `images` | `String[]`, default `[]` | Uploaded image filenames, served through `/uploads/:filename`. |
| `city` | `String`, required, trimmed | City used for rental location and filtering. |
| `pickupArea` | `String`, required, trimmed | Pickup area within the city. |
| `availableFrom` | `Date`, required | First available rental date. |
| `availableUntil` | `Date`, required | Last available rental date. |
| `driverAvailable` | `Boolean`, default `false` | Whether the provider offers a driver. |
| `driverCharges` | `Number`, minimum `0` | Optional additional daily driver charge. |
| `minRentalDays` | `Number`, default `1`, minimum `1` | Shortest permitted rental period. |
| `maxRentalDays` | `Number`, default `30`, minimum `1` | Longest permitted rental period. |
| `status` | `String`, enum: `draft`, `active`, `reserved`, `rented`, `unavailable`, `archived`; default `draft` | Listing lifecycle/availability state. Public catalogue reads only `active` records. |
| `createdAt` / `updatedAt` | Mongoose timestamps | Automatically maintained creation and modification times. |

### Related `User` data (`backend/models/user.js`)

`RentalCar.seller` references a `User` document. Rental reads populate `name` and `businessName` for seller presentation. `role` has the enum values `buyer` and `seller`; `sellerOnly` permits rental-management operations only when the decoded token has `role: 'seller'`.

## 5. Known Limitations / Not Yet Implemented

- `RentalCarDetail.jsx` explicitly displays: "Booking requests will be available in a later phase." There is no rental booking/request endpoint, rental booking model, or buyer booking action in the inspected rental files.
- No rental payment endpoint, payment model, or payment UI appears in the inspected rental module files.
- The buyer filter UI sends city, category, minimum price, and maximum price only. Although the backend supports the optional `driverAvailable` query parameter, the buyer page does not expose a corresponding filter control.
- Buyer catalogue results intentionally include only listings whose status is `active`; other status values are not publicly listed.
- The seller list has edit and delete actions, but no separate seller rental detail view or image-management view; edit is handled through the add route with an `edit` query parameter.
- Rental image uploads are accepted and saved as filenames, but the inspected rental frontend does not render existing images or image-removal controls in edit mode.
- The backend includes `backend/seedRentals.js`, but `backend/package.json` does not define an npm script for running that seed file.
