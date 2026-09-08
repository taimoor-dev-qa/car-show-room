import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import '../../styles/01-base-header.css';
import '../../styles/02-hero-categories.css';
import '../../styles/03-featured-listings.css';
import '../../styles/04-car-card.css';
import '../../styles/05-stats-testimonials.css';
import '../../styles/06-cta-footer.css';
import '../../styles/07-car-detail.css';
import HomeIntro from '../../components/sale/HomeIntro';
import HomeFooter from '../../components/sale/HomeFooter';
import SaleListings from '../../components/sale/SaleListings';
import '../../styles/12-compare.css';

export default function Home() {
  const [selectedIds, setSelectedIds] = useState([]);
  const [compareMessage, setCompareMessage] = useState('');
  const [cars, setCars] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState([]);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) fetchFavorites();
  }, [user]);

  const fetchFavorites = async () => {
    try {
      const res = await API.get('/favorites');
      setFavoriteIds(res.data.map((car) => car._id));
    } catch (err) {
      console.error('Failed to fetch favorites', err);
    }
  };

  const toggleFavorite = async (carId) => {
    if (!user) { navigate('/login'); return; }
    try {
      const res = await API.post(`/favorites/${carId}`);
      if (res.data.favorited) {
        setFavoriteIds((prev) => [...prev, carId]);
      } else {
        setFavoriteIds((prev) => prev.filter((id) => id !== carId));
      }
    } catch (err) {
      console.error('Failed to toggle favorite', err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCars();
    }, 400);
    return () => clearTimeout(timer);
  }, [activeCategory, searchTerm, sortBy]);

  const fetchCars = async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeCategory !== 'All') params.category = activeCategory;
      if (searchTerm.trim()) params.search = searchTerm.trim();
      params.sort = sortBy;

      const res = await API.get('/cars', { params });
      setCars(res.data);
    } catch (err) {
      console.error('Failed to fetch cars', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleCompare = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((selected) => selected !== id));
      setCompareMessage('');
    } else if (selectedIds.length === 3) {
      setCompareMessage('You can compare up to 3 cars. Remove one to select another.');
    } else {
      setSelectedIds([...selectedIds, id]);
      setCompareMessage('');
    }
  };

  return (
  <>
    <HomeIntro
      {...{
        user,
        logout,
        searchTerm,
        setSearchTerm,
        fetchCars,
      }}
    />

    <SaleListings
      {...{
        cars,
        loading,
        activeCategory,
        setActiveCategory,
        sortBy,
        setSortBy,
        favoriteIds,
        toggleFavorite,
        selectedIds,
        toggleCompare,
      }}
    />

    <HomeFooter />

    {selectedIds.length > 0 && (
      <div className="compare-bar">
        {compareMessage && (
          <span role="status">
            {compareMessage}
          </span>
        )}

        <button
          type="button"
          onClick={() =>
            navigate(
              '/compare?ids=' + selectedIds.join(',')
            )
          }
        >
          Compare ({selectedIds.length})
        </button>

        <button
          type="button"
          className="compare-secondary"
          onClick={() => {
            setSelectedIds([]);
            setCompareMessage('');
          }}
        >
          Clear
        </button>
      </div>
    )}
  </>
);
}