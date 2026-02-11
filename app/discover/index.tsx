/**
 * Discover Stylists - Vagaro Killer Feature
 * Path: /discover
 * Protected route - client role only
 * 
 * Clients can search, filter, and find stylists to book
 */

import { useRouter } from "expo-router";
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import Toast from "react-native-toast-message";
import { useAuth } from "../../context/AuthContext";
import withRoleGuard from "../../utils/withRoleGuard";
import api from "../../utils/api";

const { width } = Dimensions.get("window");

// Filter categories
const FILTERS = [
  { id: "all", label: "All" },
  { id: "hair", label: "Hair" },
  { id: "nails", label: "Nails" },
  { id: "spa", label: "Spa" },
  { id: "makeup", label: "Makeup" },
  { id: "top-rated", label: "⭐ Top Rated" },
  { id: "available-today", label: "Available Today" },
];

// Types
interface StylistService {
  name: string;
  price: number;
}

interface Stylist {
  id: string;
  name: string;
  avatarUrl?: string;
  rating: number;
  reviewCount: number;
  location: string;
  distance: string;
  services: StylistService[];
  categories: string[];
  isAvailableToday: boolean;
  isFeatured?: boolean;
}

// Generate star rating display
const StarRating = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <View style={styles.starsContainer}>
      {[...Array(fullStars)].map((_, i) => (
        <Text key={`full-${i}`} style={styles.star}>★</Text>
      ))}
      {hasHalfStar && <Text style={styles.star}>☆</Text>}
      {[...Array(emptyStars)].map((_, i) => (
        <Text key={`empty-${i}`} style={[styles.star, styles.starEmpty]}>★</Text>
      ))}
    </View>
  );
};

// Avatar placeholder
const Avatar = ({ size = 60, url }: { size?: number; url?: string }) => (
  <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
    <Text style={[styles.avatarText, { fontSize: size * 0.4 }]}>
      {url ? "📷" : "💇"}
    </Text>
  </View>
);

function DiscoverScreen() {
  const router = useRouter();
  const { user, updateActivity } = useAuth();

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  
  // Data state
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [featuredStylists, setFeaturedStylists] = useState<Stylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Fetch stylists on mount and when filters change
  useEffect(() => {
    fetchStylists(true);
  }, [activeFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        fetchStylists(true);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchStylists = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setPage(1);
      } else {
        setLoadingMore(true);
      }

      const currentPage = reset ? 1 : page;

      // TODO: Replace with actual API call
      // const res = await api.get('/stylists/search', {
      //   params: {
      //     q: searchQuery,
      //     filter: activeFilter,
      //     page: currentPage,
      //     limit: 10,
      //   },
      // });

      // Mock data
      await new Promise((resolve) => setTimeout(resolve, reset ? 800 : 600));

      const mockStylists: Stylist[] = [
        {
          id: "stylist_1",
          name: "Sarah's Beauty Studio",
          rating: 4.9,
          reviewCount: 128,
          location: "Downtown",
          distance: "0.8 mi",
          services: [
            { name: "Haircut", price: 45 },
            { name: "Color", price: 85 },
          ],
          categories: ["hair", "makeup"],
          isAvailableToday: true,
          isFeatured: true,
        },
        {
          id: "stylist_2",
          name: "Glam by Jessica",
          rating: 4.7,
          reviewCount: 89,
          location: "Midtown",
          distance: "1.2 mi",
          services: [
            { name: "Makeup", price: 65 },
            { name: "Blowout", price: 35 },
          ],
          categories: ["makeup", "hair"],
          isAvailableToday: true,
          isFeatured: true,
        },
        {
          id: "stylist_3",
          name: "Nails by Maria",
          rating: 4.8,
          reviewCount: 234,
          location: "Westside",
          distance: "2.1 mi",
          services: [
            { name: "Manicure", price: 25 },
            { name: "Pedicure", price: 35 },
          ],
          categories: ["nails"],
          isAvailableToday: false,
        },
        {
          id: "stylist_4",
          name: "The Spa Experience",
          rating: 4.6,
          reviewCount: 56,
          location: "Eastside",
          distance: "3.5 mi",
          services: [
            { name: "Facial", price: 75 },
            { name: "Massage", price: 95 },
          ],
          categories: ["spa"],
          isAvailableToday: true,
        },
        {
          id: "stylist_5",
          name: "Braids & Locs by Keisha",
          rating: 5.0,
          reviewCount: 312,
          location: "Uptown",
          distance: "1.5 mi",
          services: [
            { name: "Box Braids", price: 120 },
            { name: "Locs", price: 85 },
          ],
          categories: ["hair"],
          isAvailableToday: true,
        },
        {
          id: "stylist_6",
          name: "Elite Barber Shop",
          rating: 4.5,
          reviewCount: 178,
          location: "Downtown",
          distance: "0.5 mi",
          services: [
            { name: "Haircut", price: 30 },
            { name: "Beard Trim", price: 15 },
          ],
          categories: ["hair"],
          isAvailableToday: false,
        },
      ];

      // Filter based on active filter
      let filtered = mockStylists;
      if (activeFilter !== "all") {
        filtered = mockStylists.filter((s) => {
          if (activeFilter === "top-rated") return s.rating >= 4.8;
          if (activeFilter === "available-today") return s.isAvailableToday;
          return s.categories.includes(activeFilter);
        });
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (s) =>
            s.name.toLowerCase().includes(query) ||
            s.location.toLowerCase().includes(query) ||
            s.services.some((svc) => svc.name.toLowerCase().includes(query))
        );
      }

      const featured = mockStylists.filter((s) => s.isFeatured).slice(0, 5);

      if (reset) {
        setStylists(filtered);
        setFeaturedStylists(featured);
        setHasMore(filtered.length >= 10);
      } else {
        setStylists((prev) => [...prev, ...filtered]);
        setHasMore(filtered.length >= 10);
      }

      await updateActivity();
    } catch (err) {
      console.error("Error fetching stylists:", err);
      Toast.show({
        type: "error",
        text1: "Failed to load stylists",
        text2: "Please try again",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStylists(true);
  }, []);

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      setPage((prev) => prev + 1);
      fetchStylists(false);
    }
  };

  // Get lowest price from services
  const getLowestPrice = (services: StylistService[]): number => {
    if (!services.length) return 0;
    return Math.min(...services.map((s) => s.price));
  };

  // Navigate to booking
  const handleBookNow = (stylistId: string) => {
    router.push(`/book/${stylistId}`);
  };

  // Render featured stylist card
  const renderFeaturedCard = ({ item }: { item: Stylist }) => (
    <TouchableOpacity
      style={styles.featuredCard}
      onPress={() => handleBookNow(item.id)}
      activeOpacity={0.8}
    >
      <View style={styles.featuredAvatar}>
        <Avatar size={80} />
      </View>
      <Text style={styles.featuredName} numberOfLines={1}>
        {item.name}
      </Text>
      <View style={styles.featuredRating}>
        <StarRating rating={item.rating} />
        <Text style={styles.featuredReviewCount}>({item.reviewCount})</Text>
      </View>
      <Text style={styles.featuredPrice}>From ${getLowestPrice(item.services)}</Text>
    </TouchableOpacity>
  );

  // Render main stylist card
  const renderStylistCard = ({ item }: { item: Stylist }) => (
    <View style={styles.stylistCard}>
      <View style={styles.cardHeader}>
        <Avatar size={60} />
        <View style={styles.cardInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.stylistName} numberOfLines={1}>
              {item.name}
            </Text>
            {item.isAvailableToday && (
              <View style={styles.availableBadge}>
                <Text style={styles.availableText}>Available Today</Text>
              </View>
            )}
          </View>
          <View style={styles.ratingRow}>
            <StarRating rating={item.rating} />
            <Text style={styles.reviewCount}>({item.reviewCount})</Text>
          </View>
          <Text style={styles.locationText}>
            📍 {item.location} • {item.distance}
          </Text>
          <View style={styles.categoriesRow}>
            {item.categories.slice(0, 3).map((cat, idx) => (
              <View key={idx} style={styles.categoryChip}>
                <Text style={styles.categoryChipText}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
      
      <View style={styles.cardFooter}>
        <View style={styles.priceContainer}>
          <Text style={styles.fromText}>From</Text>
          <Text style={styles.priceText}>${getLowestPrice(item.services)}</Text>
        </View>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => handleBookNow(item.id)}
        >
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render filter chip
  const renderFilterChip = ({ item }: { item: typeof FILTERS[0] }) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        activeFilter === item.id && styles.filterChipActive,
      ]}
      onPress={() => setActiveFilter(item.id)}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.filterChipText,
          activeFilter === item.id && styles.filterChipTextActive,
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  // Empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🔍</Text>
      <Text style={styles.emptyTitle}>No stylists found</Text>
      <Text style={styles.emptySubtitle}>
        Try adjusting your search or filters to find more stylists
      </Text>
      <TouchableOpacity
        style={styles.clearFiltersButton}
        onPress={() => {
          setSearchQuery("");
          setActiveFilter("all");
        }}
      >
        <Text style={styles.clearFiltersText}>Clear Filters</Text>
      </TouchableOpacity>
    </View>
  );

  // Footer loader
  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#E75480" />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover</Text>
        <Text style={styles.headerSubtitle}>Find your perfect stylist</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, service, or location..."
            placeholderTextColor="#8E8E93"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Chips */}
      <View style={styles.filtersContainer}>
        <FlatList
          data={FILTERS}
          keyExtractor={(item) => item.id}
          renderItem={renderFilterChip}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersList}
        />
      </View>

      {/* Main Content */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E75480" />
          <Text style={styles.loadingText}>Finding stylists near you...</Text>
        </View>
      ) : (
        <FlatList
          data={stylists}
          keyExtractor={(item) => item.id}
          renderItem={renderStylistCard}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#E75480"
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={renderFooter}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            featuredStylists.length > 0 ? (
              <View style={styles.featuredSection}>
                <Text style={styles.featuredTitle}>⭐ Featured Stylists</Text>
                <FlatList
                  data={featuredStylists}
                  keyExtractor={(item) => `featured-${item.id}`}
                  renderItem={renderFeaturedCard}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.featuredList}
                />
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

export default withRoleGuard(DiscoverScreen, "client");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8FA",
  },
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1A1A1A",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: "#8E8E93",
    marginTop: 4,
  },
  searchContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F7",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#1A1A1A",
  },
  clearIcon: {
    fontSize: 14,
    color: "#8E8E93",
    padding: 4,
  },
  filtersContainer: {
    backgroundColor: "#fff",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  filtersList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F2F2F7",
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: "#E75480",
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#3A3A3C",
  },
  filterChipTextActive: {
    color: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: "#8E8E93",
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  // Featured Section
  featuredSection: {
    marginBottom: 24,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  featuredList: {
    paddingRight: 16,
  },
  featuredCard: {
    width: 140,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    alignItems: "center",
  },
  featuredAvatar: {
    marginBottom: 12,
  },
  featuredName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
    textAlign: "center",
    marginBottom: 6,
  },
  featuredRating: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  featuredReviewCount: {
    fontSize: 11,
    color: "#8E8E93",
    marginLeft: 4,
  },
  featuredPrice: {
    fontSize: 13,
    fontWeight: "600",
    color: "#E75480",
  },
  // Main Stylist Cards
  stylistCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    marginBottom: 16,
  },
  avatar: {
    backgroundColor: "#F2F2F7",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarText: {
    color: "#8E8E93",
  },
  cardInfo: {
    flex: 1,
    marginLeft: 14,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  stylistName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1A1A1A",
    flex: 1,
  },
  availableBadge: {
    backgroundColor: "#34C759",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: 8,
  },
  availableText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#fff",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  starsContainer: {
    flexDirection: "row",
  },
  star: {
    fontSize: 14,
    color: "#FFB800",
    marginRight: 1,
  },
  starEmpty: {
    color: "#E5E5EA",
  },
  reviewCount: {
    fontSize: 13,
    color: "#8E8E93",
    marginLeft: 6,
  },
  locationText: {
    fontSize: 13,
    color: "#8E8E93",
    marginBottom: 8,
  },
  categoriesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  categoryChip: {
    backgroundColor: "#F2F2F7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryChipText: {
    fontSize: 11,
    color: "#3A3A3C",
    fontWeight: "500",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#F2F2F7",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  fromText: {
    fontSize: 13,
    color: "#8E8E93",
    marginRight: 4,
  },
  priceText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  bookButton: {
    backgroundColor: "#E75480",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: "#E75480",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  bookButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  // Empty State
  emptyContainer: {
    paddingTop: 80,
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: "#8E8E93",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  clearFiltersButton: {
    backgroundColor: "#E75480",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  clearFiltersText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
  },
});
