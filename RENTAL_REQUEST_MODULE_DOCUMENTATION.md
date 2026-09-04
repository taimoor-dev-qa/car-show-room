# CarZone Rental Booking/Request Module Documentation

## 1. Overview

The Rental Booking/Request module adds a request workflow on top of the existing `RentalCar` listing module. Buyers select rental dates, optionally request a driver when the listing provides one, add pickup notes, and submit a request that the server validates and prices from the linked rental car. Buyers can then view their own requests and cancel requests that remain pending. Sellers receive requests for rental cars they own, can accept or reject pending requests, and acceptance changes the linked `RentalCar` listing status to `reserved`. The request record connects the existing rental-car listing to both the buyer and the seller, while calculated duration and estimated cost are stored server-side.

## 2. Backend Structure

### Files

| Path | Purpose | Exported functions / schema fields |
| --- | --- | --- |
| `backend/models/RentalRequest.js` | Defines the Mongoose document for one buyer rental request. | Default export: `mongoose.model('RentalRequest', rentalRequestSchema)`. Fields are detailed in [Data Model](#4-data-model). |
| `backend/controllers/rentalRequestController.js` | Implements creation, buyer and seller request retrieval, seller status decisions, and buyer cancellation. It also calculates days/cost and validates booking ranges. | Exports: `createRequest`, `getMyRequests`, `getSellerRequests`, `updateRequestStatus`, `cancelRequest`. Internal helpers: `daysBetween(startDate, endDate)` and `validRange(rentalCar, startDate, endDate, totalDays)`. |
| `backend/routes/rentalRequestRoutes.js` | Defines request HTTP routes and attaches auth/role middleware. | Default export: Express `router`. |
| `backend/server.js` | Imports the request router and mounts it at `/api/rental-requests`. | Registers `app.use('/api/rental-requests', rentalRequestRoutes)`. |
| `backend/models/RentalCar.js` | Existing related model queried during request creation and updated when a request is accepted. | Default export: `RentalCar`. Request logic reads seller, daily rate, driver availability/charges, availability dates, and rental-day limits; acceptance updates its `status` to `reserved`. |
| `backend/models/user.js` | Existing related model referenced by `RentalRequest.buyer` and `RentalRequest.seller`. | Default export: `User`. Buyer request reads populate seller `name` and `businessName`; seller request reads populate buyer `name` and `email`. |
| `backend/middleware/authMiddleware.js` | Shared JWT and seller-role protection reused by request routes. | Named exports: `protect` verifies a Bearer JWT and sets `req.user` from decoded token data; `sellerOnly` allows only `req.user.role === 'seller'`. |

### API endpoints

All endpoints use the prefix registered in `server.js`: `/api/rental-requests`. JSON request and response bodies use the centralized Express JSON middleware. Successful request records contain the `RentalRequest` fields plus Mongoose `_id`, `createdAt`, and `updatedAt`.

| Method and full path | Purpose | Middleware | Expected request data | Success response | Validation / error behavior / side effects |
| --- | --- | --- | --- | --- | --- |
| `POST /api/rental-requests` | Creates a request for an existing rental car. The server derives buyer, seller, total days, and estimate; it does not read client-provided totals or seller identity. | `protect` | JSON body: `rentalCarId`, `startDate`, `endDate`, optional `driverRequested` (defaults to `false` if omitted), optional `pickupNotes`. Bearer token required. | `201 Created` with the new `RentalRequest` JSON object. | Returns `404` `{ "message": "Rental car not found" }` if no linked rental car exists. Returns `400` with `{ "message": "Choose dates within the car availability and rental-day limits" }` for invalid dates, start date not before end date, a date range outside `availableFrom`/`availableUntil`, or a day count outside `minRentalDays`/`maxRentalDays`. Returns `400` `{ "message": "A driver is not available for this rental car" }` if a driver is requested for a listing without `driverAvailable`. Other exceptions return `500` `{ "message": "<error message>" }`. `totalDays` is `Math.ceil((endDate - startDate) / 86,400,000)`. `estimatedTotal` is `(dailyRate + applicable driverCharges) * totalDays`. |
| `GET /api/rental-requests/mine` | Retrieves the authenticated buyer's requests, newest first. | `protect` | Bearer token; no body or parameters. | `200 OK` with `RentalRequest[]`. Each request populates `rentalCar` with `makeModel`, `images`, `dailyRate` and `seller` with `name`, `businessName`. | Exceptions return `500` message JSON. |
| `GET /api/rental-requests/seller` | Retrieves incoming requests for rental cars owned by the authenticated seller, newest first. | `protect`, `sellerOnly` | Bearer token; no body or parameters. | `200 OK` with `RentalRequest[]`. Each request populates `rentalCar` with `makeModel`, `images`, `dailyRate` and `buyer` with `name`, `email`. | Authentication errors from `protect`: `401` with no-token or invalid-token message. A non-seller receives `403` `{ "message": "Only sellers can do this" }`. Exceptions return `500` message JSON. |
| `PATCH /api/rental-requests/:id/status` | Lets the owning seller accept or reject a pending request. | `protect`, `sellerOnly`, then controller seller ownership check | Path parameter `id`; JSON body `{ "status": "accepted" }` or `{ "status": "rejected" }`; Bearer token. | `200 OK` with the updated (unpopulated) `RentalRequest`. | Rejects any other supplied status with `400` `{ "message": "Status must be accepted or rejected" }`. Returns `404` if no request exists, `403` `{ "message": "Not your rental request" }` if its seller differs from the token user, and `400` `{ "message": "Only pending requests can be updated" }` for a non-pending request. On `accepted`, calls `RentalCar.findByIdAndUpdate(request.rentalCar, { status: 'reserved' })`. Exceptions return `500` message JSON. |
| `PATCH /api/rental-requests/:id/cancel` | Lets the owning buyer cancel their own pending request. | `protect`, then controller buyer ownership check | Path parameter `id`; no body; Bearer token. | `200 OK` with the updated (unpopulated) `RentalRequest`, whose status is `cancelled`. | Returns `404` if no request exists, `403` `{ "message": "Not your rental request" }` if its buyer differs from the token user, and `400` `{ "message": "Only pending requests can be cancelled" }` for a non-pending request. Exceptions return `500` message JSON. |

## 3. Frontend Structure

### Files

| Path | Description |
| --- | --- |
| `frontend/src/pages/buyer/RentalCarDetail.jsx` | Existing rental detail page, extended with the `Request to Rent` form. It loads the rental car, restricts date input min/max values to listing availability, provides start/end dates, conditionally renders a driver checkbox only when `driverAvailable` is true, accepts pickup notes, and displays a browser-calculated estimated price. Submission posts to `/rental-requests`; unauthenticated users are sent to `/login`, while a successful request displays a success message and navigates to `/my-rentals` after 1.2 seconds. Local helpers: `dateValue` and `dayCount`; its existing `Spec` component continues to render detail metadata. |
| `frontend/src/pages/buyer/MyRentals.jsx` | Buyer request-history page. Requires an authenticated user client-side, fetches `/rental-requests/mine`, and displays image/placeholder, car, request dates, day count, seller/provider, estimated total, and a status badge. Pending requests offer a confirmation-based Cancel action that calls `PATCH /rental-requests/:id/cancel` and reloads the list. |
| `frontend/src/pages/seller/RentalRequests.jsx` | Seller incoming-request page. Redirects users without seller role to `/seller/login`, fetches `/rental-requests/seller`, and displays a seller-panel table with buyer name/email, car, dates/days, estimated total, status, and actions. Pending rows offer Accept and Reject actions that call `PATCH /rental-requests/:id/status` with the respective status. |
| `frontend/src/styles/10-rental.css` | Existing rental stylesheet extended with request-card/form, estimate, success, request-list, thumbnail, request-summary, request-status color, and mobile responsive rules. It uses the existing red/dark/card/shadow visual system. |
| `frontend/src/App.jsx` | Imports the two request pages and registers their React Router routes. |
| `frontend/src/api/axios.js` | Shared Axios client used by each request screen. Its base URL is `http://localhost:3500/api`, so frontend paths such as `/rental-requests/mine` target `/api/rental-requests/mine`; its interceptor sends the locally stored JWT as a Bearer token. |
| `frontend/src/context/AuthContext.jsx` | Shared authentication context used by the buyer form and both request pages to read `user`, redirect where applicable, and provide logout controls. |

No standalone reusable request component directory is present. The booking form lives in `RentalCarDetail.jsx`; the buyer and seller list UIs are each self-contained page components.

### Registered routes

| Route registered in `frontend/src/App.jsx` | Component |
| --- | --- |
| `/my-rentals` | `MyRentals` |
| `/seller/rental-requests` | `RentalRequests` |

### Navigation links added for this feature

| File | Added link |
| --- | --- |
| `frontend/src/pages/buyer/Home.jsx` | Buyer header: `My Rentals` -> `/my-rentals` (shown when a user exists). |
| `frontend/src/pages/buyer/CarsForRent.jsx` | Buyer header: `My Rentals` -> `/my-rentals` (shown when a user exists). |
| `frontend/src/pages/buyer/MyRentals.jsx` | Buyer header: active `My Rentals` -> `/my-rentals`. |
| `frontend/src/pages/seller/Dashboard.jsx` | Seller sidebar: `Rental Requests` -> `/seller/rental-requests`. |
| `frontend/src/pages/seller/Profile.jsx` | Seller sidebar: `Rental Requests` -> `/seller/rental-requests`. |
| `frontend/src/pages/seller/Inquiries.jsx` | Seller sidebar: `Rental Requests` -> `/seller/rental-requests`. |
| `frontend/src/pages/seller/Chat.jsx` | Seller sidebar: `Rental Requests` -> `/seller/rental-requests`. |
| `frontend/src/pages/seller/MyRentalCars.jsx` | Seller sidebar: `Rental Requests` -> `/seller/rental-requests`. |
| `frontend/src/pages/seller/AddRentalCar.jsx` | Seller sidebar: `Rental Requests` -> `/seller/rental-requests`. |
| `frontend/src/pages/seller/RentalRequests.jsx` | Seller sidebar: active `Rental Requests` -> `/seller/rental-requests`. |

## 4. Data Model

### `RentalRequest` (`backend/models/RentalRequest.js`)

| Field | Type / constraints | Default | Purpose |
| --- | --- | --- | --- |
| `rentalCar` | `ObjectId`, ref `RentalCar`, required | None | Rental listing that the buyer requests. Set by the server from `rentalCarId`. |
| `buyer` | `ObjectId`, ref `User`, required | None | Requesting authenticated user. Set by the server from `req.user.id`. |
| `seller` | `ObjectId`, ref `User`, required | None | Owner of the linked `RentalCar`; used to retrieve and authorize incoming seller requests. Set by the server from `rentalCar.seller`. |
| `startDate` | `Date`, required | None | Requested rental start date. |
| `endDate` | `Date`, required | None | Requested rental end date. |
| `totalDays` | `Number`, required | None | Server-calculated requested duration, using a ceiling of the millisecond date difference divided by one day. |
| `estimatedTotal` | `Number`, required | None | Server-calculated estimated price: daily rate times total days, plus daily driver charge times total days when a driver is requested. |
| `driverRequested` | `Boolean` | `false` | Records whether the buyer asked for a driver. |
| `pickupNotes` | `String`, trimmed | None | Optional buyer pickup preferences/notes. |
| `status` | `String`, enum: `pending`, `accepted`, `rejected`, `cancelled`, `completed` | `pending` | Request lifecycle state. The seller status endpoint accepts only `accepted` and `rejected`; the buyer cancel endpoint changes a pending request to `cancelled`. |
| `createdAt` / `updatedAt` | Mongoose timestamps | Automatic | Creation and latest-modification timestamps supplied by `{ timestamps: true }`. |

## 5. Known Limitations / Not Yet Implemented

- No payment model, payment endpoint, payment UI, or payment call is present in the request model, controller, routes, or request pages.
- No request-specific chat/conversation field, route call, or UI control is present. Existing chat navigation remains separate from request records.
- No notification model, email/SMS call, Socket.IO event, or client notification appears in the request status update/cancellation code; the pages refresh their request lists after their own action.
- The request status endpoint only exposes seller transitions to `accepted` and `rejected`; there is no exposed endpoint/UI action for changing a request to `completed`.
- Request creation checks the selected dates against the linked `RentalCar` availability and rules, but the controller does not query existing requests for overlapping booking dates before creating a new request.
- The acceptance flow sets the linked `RentalCar` status to `reserved`. The observed cancellation flow only permits pending requests and changes the request status to `cancelled`; it does not update a `RentalCar` status.
- The buyer form shows a browser-side estimate, but the server recalculates the stored total from the linked rental listing. The buyer request-list page displays the stored `estimatedTotal` and does not provide an edit action for a request.
