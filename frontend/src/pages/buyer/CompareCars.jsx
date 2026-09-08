import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import API from '../../api/axios';

import '../../styles/12-compare.css';

const number = (value) =>
  value == null
    ? '—'
    : Number(value).toLocaleString();

const attributes = [
  [
    'Make / model',
    'makeModel',
  ],
  [
    'Year',
    'year',
  ],
  [
    'Price',
    'price',
    (value) =>
      value == null
        ? '—'
        : `Rs. ${number(value)}`,
  ],
  [
    'Mileage',
    'mileage',
    (value) =>
      value == null
        ? '—'
        : `${number(value)} km`,
  ],
  [
    'Fuel type',
    'fuelType',
  ],
  [
    'Transmission',
    'transmission',
  ],
  [
    'Owner count',
    'ownerCount',
  ],
  [
    'Registration city',
    'registrationCity',
  ],
  [
    'Condition',
    'condition',
  ],
  [
    'Category',
    'category',
  ],
  [
    'Negotiable',
    'isNegotiable',
    (value) =>
      value == null
        ? '—'
        : value
          ? 'Yes'
          : 'No',
  ],
];

export default function CompareCars() {
  const [params, setParams] = useSearchParams();

  const rawIds = params.get('ids') || '';

  const ids = [
    ...new Set(
      rawIds
        .split(',')
        .filter((id) =>
          /^[a-f\d]{24}$/i.test(id)
        )
    ),
  ].slice(0, 3);

  const key = ids.join(',');

  const [results, setResults] = useState({});

  useEffect(() => {
    const controller = new AbortController();

    for (
      const id of key
        .split(',')
        .filter(Boolean)
    ) {
      API.get(`/cars/${id}`, {
        signal: controller.signal,
      })
        .then(({ data }) => {
          if (!controller.signal.aborted) {
            setResults((prev) => ({
              ...prev,
              [id]: {
                car: data,
              },
            }));
          }
        })
        .catch((err) => {
          if (controller.signal.aborted) {
            return;
          }

          console.error(
            `Failed to compare car ${id}:`,
            err.response?.data ||
              err.message
          );

          setResults((prev) => ({
            ...prev,
            [id]: {
              error:
                err.response?.status === 404
                  ? 'Car no longer available.'
                  : 'Unable to load car details.',
            },
          }));
        });
    }

    return () =>
      controller.abort();
  }, [key]);

  const remove = (id) => {
    const remaining = ids.filter(
      (item) => item !== id
    );

    setParams(
      remaining.length
        ? {
            ids: remaining.join(','),
          }
        : {},
      {
        replace: true,
      }
    );
  };

  return (
    <main className="compare-page">
      <Link
        to="/"
        className="compare-back"
      >
        ← Back to browsing
      </Link>

      <h1>
        Compare Cars
      </h1>

      <p className="compare-subtitle">
        Compare up to three sale cars side by side.
      </p>

      {!ids.length ? (
        <p className="compare-empty">
          Select cars from Browse Cars to start comparing.
        </p>
      ) : (
        <div
          className="compare-table-wrap"
          tabIndex={0}
          role="region"
          aria-label="Car comparison table"
        >
          <table className="compare-table">
            <caption className="compare-caption">
              Specifications for selected sale cars
            </caption>

            <thead>
              <tr>
                <th scope="col">
                  Car
                </th>

                {ids.map((id) => (
                  <th
                    scope="col"
                    key={id}
                  >
                    <strong>
                      {results[id]?.car?.makeModel ||
                        'Selected car'}
                    </strong>

                    <button
                      type="button"
                      onClick={() =>
                        remove(id)
                      }
                      aria-label={`Remove ${
                        results[id]?.car?.makeModel ||
                        'car'
                      } from comparison`}
                    >
                      Remove
                    </button>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              <tr>
                <th scope="row">
                  Image
                </th>

                {ids.map((id) => {
                  const entry = results[id];

                  const filename =
                    entry?.car?.images?.[0] ||
                    entry?.car?.image;

                  return (
                    <td key={id}>
                      {!entry ? (
                        <span role="status">
                          Loading…
                        </span>
                      ) : entry.error ? (
                        <span role="alert">
                          {entry.error}
                        </span>
                      ) : filename ? (
                        <img
                          src={`${API.defaults.baseURL.replace(
                            /\/api\/?$/,
                            ''
                          )}/uploads/${filename}`}
                          alt={entry.car.makeModel}
                        />
                      ) : (
                        <span>
                          No image available
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {attributes.map(
                ([
                  label,
                  field,
                  format,
                ]) => (
                  <tr key={field}>
                    <th scope="row">
                      {label}
                    </th>

                    {ids.map((id) => {
                      const value =
                        results[id]?.car?.[
                          field
                        ];

                      return (
                        <td key={id}>
                          {format
                            ? format(value)
                            : value ?? '—'}
                        </td>
                      );
                    })}
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}