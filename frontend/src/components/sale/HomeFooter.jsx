import { Link } from 'react-router-dom';
export default function HomeFooter() {
  return <>
      <section className="stats">
        <div className="stats-grid">
          <div className="stat-item">
            <h2>150+</h2>
            <p>Cars Listed</p>
          </div>

          <div className="stat-item">
            <h2>25K+</h2>
            <p>Happy Customers</p>
          </div>

          <div className="stat-item">
            <h2>40+</h2>
            <p>Trusted Sellers</p>
          </div>

          <div className="stat-item">
            <h2>4.8★</h2>
            <p>Customer Rating</p>
          </div>
        </div>
      </section>

      {/* ================= TESTIMONIALS ================= */}

      <section className="testimonials">
        <h1>What Our Customers Say</h1>

        <p className="section-subtitle">
          Real experiences from people who found their cars with CarZone
        </p>

        <div className="testimonial-grid">
          <div className="testimonial-card">
            <p className="stars">★★★★★</p>

            <p className="testimonial-text">
              CarZone made it really easy to find the right car. The listings
              were clear and the seller was trustworthy.
            </p>

            <h4>— Ahmed</h4>
          </div>

          <div className="testimonial-card">
            <p className="stars">★★★★★</p>

            <p className="testimonial-text">
              I found exactly what I was looking for. The whole process was
              simple and convenient.
            </p>

            <h4>— Sarah</h4>
          </div>

          <div className="testimonial-card">
            <p className="stars">★★★★★</p>

            <p className="testimonial-text">
              Great selection of cars and an easy-to-use website. I would
              definitely recommend CarZone.
            </p>

            <h4>— Bilal</h4>
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}

      <section className="cta-banner">
        <h2>Ready To Find Your Next Car?</h2>

        <p>
          Explore our latest listings and find the vehicle that is right for
          you.
        </p>

        <Link to="/cars" className="cta-btn">
          Browse All Cars
        </Link>
      </section>

      {/* ================= FOOTER ================= */}

      <footer>
        <p>© 2026 CarZone. All Rights Reserved.</p>
      </footer>
  </>;
}
