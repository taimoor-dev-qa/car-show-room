import { useEffect, useState } from 'react';
import {
    Link,
    useNavigate,
} from 'react-router-dom';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

import '../../styles/seller-style.css';

export default function Analytics() {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user || user.role !== 'seller') {
            navigate('/seller/login');
            return;
        }

        fetchCars();
    }, []);

    const fetchCars = async () => {
        try {
            const res = await API.get('/cars/mine');

            setCars(res.data);
        } catch (err) {
            console.error(
                'Failed to fetch cars',
                err
            );
        } finally {
            setLoading(false);
        }
    };

    const totalViews = cars.reduce(
        (sum, car) => sum + car.views,
        0
    );

    const totalCars = cars.length;

    const totalSold = cars.filter(
        (car) => car.status === 'sold'
    ).length;

    const avgViews =
        totalCars > 0
            ? Math.round(totalViews / totalCars)
            : 0;

    const chartData = [...cars]
        .sort(
            (a, b) =>
                b.views - a.views
        )
        .slice(0, 8)
        .map((car) => ({
            name: car.makeModel,
            views: car.views,
        }));

    return (
        <div className="app-layout">
            <aside className="sidebar">
                <div className="sidebar-brand">
                    <div className="brand-icon">
                        🚗
                    </div>

                    <div className="brand-text">
                        <h2>
                            Car<span>Zone</span>
                        </h2>

                        <span>
                            Seller Panel
                        </span>
                    </div>
                </div>

                <div className="sidebar-section-title">
                    MAIN MENU
                </div>

                <nav className="nav-menu">
                    <Link
                        to="/seller/dashboard"
                        className="nav-item"
                    >
                        <span>
                            Dashboard
                        </span>
                    </Link>

                    <Link
                        to="/seller/rental-cars"
                        className="nav-item"
                    >
                        Rental Cars
                    </Link>

                    <Link
                        to="/seller/rental-requests"
                        className="nav-item"
                    >
                        Rental Requests
                    </Link>

                    <Link
                        to="/seller/inquiries"
                        className="nav-item"
                    >
                        <span>
                            Inquiries
                        </span>
                    </Link>

                    <Link
                        to="/seller/analytics"
                        className="nav-item active"
                    >
                        <span>
                            Analytics
                        </span>

                    </Link>

                    <Link
                        to="/seller/chat"
                        className="nav-item"
                    >
                        <span>
                            Messages
                        </span>
                    </Link>

                </nav>

                <div className="sidebar-section-title">
                    SYSTEM
                </div>

                <nav className="nav-menu">
                    <Link
                        to="/seller/profile"
                        className="nav-item"
                    >
                        <span>
                            Settings
                        </span>
                    </Link>
                </nav>

                <div className="sidebar-footer">
                    <Link
                        to="/"
                        className="back-to-site"
                    >
                        ← Back to CarZone
                    </Link>

                    <a
                        onClick={logout}
                        className="back-to-site"
                        style={{
                            cursor: 'pointer',
                        }}
                    >
                        Logout
                    </a>
                </div>
            </aside>

            <main className="main-content">
                <header className="top-header">
                    <div className="page-heading">
                        <span className="page-eyebrow">
                            SELLER PANEL
                        </span>

                        <h1>
                            Analytics
                        </h1>

                        <p>
                            See how your listings are performing.
                        </p>
                    </div>
                </header>

                <div className="dashboard-cards">
                    <div className="card">
                        <div className="card-header">
                            <div className="card-title">
                                Total Views
                            </div>
                        </div>

                        <div className="card-value">
                            {totalViews}
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <div className="card-title">
                                Cars Listed
                            </div>
                        </div>

                        <div className="card-value">
                            {totalCars}
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <div className="card-title">
                                Cars Sold
                            </div>
                        </div>

                        <div className="card-value">
                            {totalSold}
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <div className="card-title">
                                Avg Views/Car
                            </div>
                        </div>

                        <div className="card-value">
                            {avgViews}
                        </div>
                    </div>
                </div>

                <div
                    className="content-card"
                    style={{
                        padding: 24,
                    }}
                >
                    <h2
                        style={{
                            marginBottom: 16,
                            fontSize: 16,
                        }}
                    >
                        Top 8 Cars by Views
                    </h2>

                    {loading ? (
                        <p>
                            Loading chart...
                        </p>
                    ) : chartData.length === 0 ? (
                        <p>
                            No cars to show yet.
                        </p>
                    ) : (
                        <ResponsiveContainer
                            width="100%"
                            height={320}
                        >
                            <BarChart data={chartData}>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                />

                                <XAxis
                                    dataKey="name"
                                    tick={{
                                        fontSize: 11,
                                    }}
                                />

                                <YAxis />

                                <Tooltip />

                                <Bar
                                    dataKey="views"
                                    fill="#e11d2e"
                                    radius={[6, 6, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </main>
        </div>
    );
}