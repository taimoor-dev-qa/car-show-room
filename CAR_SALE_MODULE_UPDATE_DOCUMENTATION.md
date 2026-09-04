# CarZone Car-Sale Module Update Documentation

## 1. Overview

The car-sale module now captures substantially richer vehicle information than its earlier make/model, year, price, category, description, status, and image fields. Sellers enter technical, ownership, registration, condition, accident, and negotiability information through a larger, sectioned Add/Edit Car modal. Buyers see core new facts (mileage, fuel type, transmission, and negotiability) in listing cards and see the complete vehicle profile on the detail screen. The seller modal was also widened, made comfortably scrollable, organized into spaced section cards, and given individual remove controls for newly staged image previews. These changes are sale-side only; they do not alter the rental listing or rental-request workflows.

## 2. Backend Structure

### Files changed or reviewed for this update

| Path | Purpose in this update | Added or modified contents |
| --- | --- | --- |
| `backend/models/Car.js` | Mongoose schema for cars listed for sale. | Adds the vehicle-detail, ownership, registration, condition, accident, and negotiability fields documented below. |
| `backend/controllers/carController.js` | Sale-car create, read, update, and delete controller. | Adds `carFields`, `requiredFields`, `getCarData(body)`, and `validCarData(data)`. `addCar` and `updateCar` now accept/validate the expanded data set. |
| `backend/routes/carRoutes.js` | Registers existing sale-car endpoints and their middleware. | No route changes are present in this update. The existing `POST` and `PUT` routes already use `protect`, `sellerOnly`, and `upload.array('images', 10)`. |

### Current car-sale endpoints relevant to the update

| Method / path | Middleware | Current behavior |
| --- | --- | --- |
| `POST /api/cars` | `protect`, `sellerOnly`, `upload.array('images', 10)` | `addCar` accepts the expanded sale-listing form data and uploaded image files. It creates the listing with the token seller ID and forces `status` to `pending`. |
| `PUT /api/cars/:id` | `protect`, `sellerOnly`, `upload.array('images', 10)` | `updateCar` verifies ownership, copies accepted sale fields, validates vehicle data when updating listing fields, clears accident notes if accident history is false, and replaces images if new image files are included. |
| `GET /api/cars` | None | Existing buyer catalogue endpoint. Returns active cars, optionally filtered by `category` and case-insensitive make/model `search`. New schema fields are returned as part of the car JSON. |
| `GET /api/cars/mine` | `protect`, `sellerOnly` | Existing seller listing endpoint. Returns the current seller's cars, including the new fields. |
| `GET /api/cars/:id` | None | Existing buyer detail endpoint. Populates seller name/business name, increments `views`, saves, and returns the car including new fields. |
| `DELETE /api/cars/:id` | `protect`, `sellerOnly` | Existing owner-only delete endpoint; unchanged by this update. |

### `addCar` validation and persistence

`addCar` uses `getCarData(req.body)` to accept only these keys: `makeModel`, `year`, `price`, `category`, `description`, `mileage`, `fuelType`, `transmission`, `ownerCount`, `registrationCity`, `color`, `variant`, `engineCapacity`, `isRegistered`, `condition`, `hasAccidentHistory`, `accidentNotes`, `isNegotiable`, and `status`.

It rejects a request with `400` and `{ "message": "Please complete all required vehicle details" }` unless all of the following are supplied with non-empty values: `makeModel`, `year`, `price`, `category`, `mileage`, `fuelType`, `transmission`, `ownerCount`, `registrationCity`, and `condition`. It additionally requires `mileage >= 0`, `ownerCount >= 1`, a permitted fuel type, a permitted transmission, and a permitted condition.

The controller derives image filenames from `req.files`, sets `seller` from `req.user.id`, sets `status: 'pending'`, writes the image filename array to `images`, and copies its first filename into the legacy `image` field. `accidentNotes` is stored only when `hasAccidentHistory` is boolean `true` or the multipart string `'true'`; otherwise it is set to `undefined`.

### `updateCar` validation and persistence

`updateCar` first loads the car, returns `404` if it does not exist, and returns `403` when the authenticated seller does not own it. It copies only values allowed by `getCarData`.

When the update includes any accepted field other than only `status`, it validates the resulting car with the same required-field, numeric-bound, and enum rules used for creation. If `hasAccidentHistory` is false after assignment, it clears `accidentNotes`. If image files are uploaded, their filenames replace the entire `images` array and the first new filename becomes `image`. With no uploaded files, the controller leaves the existing image fields unchanged. A status-only update therefore continues to use the existing status-update path without triggering the expanded vehicle-field validation.

## 3. Frontend Structure

### Files changed or added

| Path | What changed and why |
| --- | --- |
| `frontend/src/pages/seller/Dashboard.jsx` | Maintains sale-list loading, add/edit/delete/status operations, and the modal. It now uses `CarFormFields`, initializes the expanded form state, serializes every form field into `FormData`, applies the sale-only `modal-wide` class, and tracks newly selected image files in `imageFiles`. |
| `frontend/src/components/CarFormFields.jsx` | New extracted form component that keeps the dashboard compact. It renders logically grouped listing, technical, ownership, registration, and condition inputs and provides local `Field`, `Select`, and `Check` helpers. |
| `frontend/src/components/CarDetailMeta.jsx` | New buyer-detail metadata component. It maps the complete sale vehicle detail set to `detail-meta-card` items. |
| `frontend/src/pages/buyer/Home.jsx` | Existing sale-card rendering now adds available mileage, fuel type, and transmission values to `.car-meta`, plus a `Negotiable` badge when `isNegotiable` is true. |
| `frontend/src/pages/buyer/CarDetail.jsx` | Reworked around `CarDetailMeta`; displays variant in the title, a negotiable badge, the expanded metadata grid, and an accident-history note when applicable while retaining images, seller, inquiry, and chat behavior. |
| `frontend/src/styles/04-car-card.css` | Allows card metadata to wrap and adds `.negotiable-badge` styling. |
| `frontend/src/styles/07-car-detail.css` | Adds `.detail-negotiable-badge` and `.detail-accident-note` styling using existing detail design tokens. |
| `frontend/src/styles/seller-style.css` | Adds scoped wide-modal, section/grid, checkbox, and staged-image preview/removal styling for the seller sale-car modal. |

### Current Add/Edit Car form fields

`CarFormFields.jsx` structures fields as follows:

| Section | Inputs |
| --- | --- |
| Listing Basics | Car Make & Model (required text), Year (required number), Price (required number), Category (required select: Sedan, SUV, Hatchback, Electric, Luxury, Pickup Truck). |
| Vehicle Details | Mileage in km (required number, client `min=0`), Fuel Type (required select: Petrol, Diesel, Electric, Hybrid), Transmission (required select: Manual, Automatic), Engine Capacity in CC (optional number), Color (optional text), Variant (optional text). |
| Ownership & Registration | Previous Owner Count (required number, client `min=1`), Registration City (required text), Car is registered (checkbox; default checked). |
| Condition | Condition (required select: Excellent, Good, Fair), Car has accident history (checkbox), Accident Notes (textarea rendered only when accident history is checked), Price is negotiable (checkbox). |
| Additional | Description (optional textarea), Car Images (multiple JPEG/PNG/WEBP file input, captioned up to 10). |

### Modal sizing and spacing changes

The seller stylesheet leaves the shared `.modal-content` rule at its prior 460px maximum width. `Dashboard.jsx` applies `className="modal-content modal-wide"`, and the new modifier makes only the sale-car modal wider and more spacious:

- `.modal-content.modal-wide`: `max-width: 780px`, `max-height: 88vh`, `padding: 32px 36px`, and a larger shadow.
- `.modal-wide form`: grid layout with a 20px gap; its direct `.form-group` margins are reset because gap controls vertical spacing.
- `.car-form-section`: bordered, white section card with 20px padding.
- `.car-form-grid`: two equal columns with 16px/18px gaps; at 700px and below it becomes one column.
- `.car-form-check`: aligned brand-accented checkbox layout.

### Staged image preview and remove-button behavior

`Dashboard.jsx` stores selected upload files in `imageFiles` state. The file input converts the selected `FileList` to an array and limits that selection to its first ten files. The preview area maps the current `imageFiles` array to `.image-preview-item` elements, each with an object-URL image preview and an `×` button.

Clicking that button calls `removeStagedImage(index)`, which uses `setImageFiles((files) => files.filter((_, fileIndex) => fileIndex !== index))`. This removes exactly that file from both the visual previews and the state later used by `submit`. On submit, `imageFiles.forEach((file) => data.append('images', file))` appends only remaining staged files to `FormData`.

The seller stylesheet provides `.image-preview-row`, `.image-preview-item`, `.image-preview-item img`, and `.image-preview-remove` styles: compact card thumbnails, a red circular corner button, and a darker-red hover state.

## 4. Data Model

### Complete current `Car` schema (`backend/models/Car.js`)

| Field | Type / constraints | Default / status | Purpose |
| --- | --- | --- | --- |
| `seller` | `ObjectId`, ref `User`, required | No default | Seller who owns the sale listing. |
| `makeModel` | `String`, required | No default | Vehicle make and model. |
| `year` | `Number`, required | No default | Model year. |
| `price` | `Number`, required | No default | Sale price in rupees. |
| `category` | `String`, required; enum `Sedan`, `SUV`, `Hatchback`, `Electric`, `Luxury`, `Pickup Truck` | No default | Vehicle category. |
| `description` | `String`, optional | No default | Seller description. |
| `mileage` | `Number`, required, minimum `0` | No default | Kilometres driven. |
| `fuelType` | `String`, required; enum `Petrol`, `Diesel`, `Electric`, `Hybrid` | No default | Fuel/power type. |
| `transmission` | `String`, required; enum `Manual`, `Automatic` | No default | Transmission type. |
| `ownerCount` | `Number`, required, minimum `1` | No default | Number of previous owners. |
| `registrationCity` | `String`, required, trimmed | No default | Registration city. |
| `color` | `String`, optional, trimmed | No default | Exterior color. |
| `variant` | `String`, optional, trimmed | No default | Variant/trim, for example Altis Grande. |
| `engineCapacity` | `Number`, optional | No default | Engine size in CC. |
| `isRegistered` | `Boolean` | `true` | Whether the car is registered. |
| `condition` | `String`, required; enum `Excellent`, `Good`, `Fair` | No default | Seller-stated condition. |
| `hasAccidentHistory` | `Boolean` | `false` | Indicates a reported accident history. |
| `accidentNotes` | `String`, optional, trimmed | No default | Accident information, persisted by the controller only when accident history is true. |
| `isNegotiable` | `Boolean` | `false` | Whether the seller accepts price negotiation. |
| `status` | `String`; enum `active`, `pending`, `sold` | `pending` | Sale listing lifecycle/status. The create controller explicitly uses `pending`. |
| `views` | `Number` | `0` | Detail-page view count; incremented by `getCarById`. |
| `image` | `String` | Empty string | Legacy single-image fallback; create/update assigns the first uploaded filename when files are supplied. |
| `images` | `String[]` | Empty array | Uploaded image filename array. |
| `createdAt` / `updatedAt` | Mongoose timestamps | Automatic | Creation and last-update timestamps. |

## 5. Verification of Isolation

The following files were not touched by the car-sale update documented here. Their contents may implement prior rental work, but this sale-side update does not modify them.

| Rental module file | Status for this car-sale update |
| --- | --- |
| `backend/models/RentalCar.js` | Unchanged. |
| `backend/models/RentalRequest.js` | Unchanged. |
| `backend/controllers/rentalCarController.js` | Unchanged. |
| `backend/controllers/rentalRequestController.js` | Unchanged. |
| `backend/routes/rentalRoutes.js` | Unchanged. |
| `backend/routes/rentalRequestRoutes.js` | Unchanged. |
| `frontend/src/pages/seller/AddRentalCar.jsx` | Unchanged. |
| `frontend/src/pages/seller/MyRentalCars.jsx` | Unchanged. |
| `frontend/src/pages/buyer/CarsForRent.jsx` | Unchanged. |
| `frontend/src/pages/buyer/RentalCarDetail.jsx` | Unchanged. |
| `frontend/src/pages/buyer/MyRentals.jsx` | Unchanged. |
| `frontend/src/pages/seller/RentalRequests.jsx` | Unchanged. |
| `frontend/src/styles/10-rental.css` | Unchanged. |

## 6. Known Limitations / Not Yet Implemented

- `price` and `year` are required by the schema and controller presence checks, but neither has a model `min` constraint or an explicit controller numeric-range check.
- `engineCapacity` is optional and has no model minimum constraint; the seller form provides a client-side `min="0"` attribute only.
- The sale controller permits up to ten uploaded files through route middleware. The dashboard limits each individual file selection to the first ten files, but it does not show a dedicated validation message when a user selects more.
- The Add/Edit Car modal previews and can remove newly staged files only. There is no displayed management UI for previously saved sale-listing images during edit mode. When new image files are sent to `updateCar`, the controller replaces the stored `images` array with the new filenames.
- The browser creates preview object URLs in the render mapping; the displayed code has no explicit URL-revocation cleanup.
- Accident notes are conditionally shown in the seller form and cleared by the controller when accident history is false, but the schema itself does not enforce that conditional relationship.
- No separate sale listing fields or API are present for service history, inspection reports, financing, or a price-offer workflow.
