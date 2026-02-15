import axios from 'axios';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const API_BASE = 'https://gloweazy-backend.onrender.com';

type Service = {
  id: string;
  name: string;
  price: number;
  duration: number;
};

type Stylist = {
  _id: string;
  name: string;
  specialty: string[];
  rating: number;
  reviewCount: number;
  profileImage?: string;
  bio?: string;
  services: Service[];
  location?: {
    city: string;
    address: string;
  };
};

export default function ExploreScreen() {
  const router = useRouter();
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Braids', 'Makeup', 'Haircuts', 'Massage', 'Nails'];

  useEffect(() => {
    fetchStylists();
  }, []);

  const fetchStylists = async (query = '') => {
    setLoading(true);
    try {
      const url = query 
        ? `${API_BASE}/stylists/search?q=${encodeURIComponent(query)}`
        : `${API_BASE}/stylists/search`;
      
      const res = await axios.get(url);
      console.log('Fetched stylists:', res.data.stylists?.length || 0);
      setStylists(res.data.stylists || []);
    } catch (err) {
      console.error('Error fetching stylists:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchStylists(searchQuery);
  };

  const filteredStylists = selectedCategory === 'All' 
    ? stylists 
    : stylists.filter(s => s.specialty?.some(spec => 
        spec.toLowerCase().includes(selectedCategory.toLowerCase())
      ));

  const getLowestPrice = (services: Service[]) => {
    if (!services?.length) return 0;
    return Math.min(...services.map(s => s.price));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Discover Stylists</Text>
        <Text style={styles.subtitle}>Book premium beauty services</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search stylists, services..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Ionicons name="search" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryContainer}
        contentContainerStyle={styles.categoryContent}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryButton,
              selectedCategory === cat && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === cat && styles.categoryTextActive
            ]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Stylists List */}
      <ScrollView 
        style={styles.stylistsContainer}
        contentContainerStyle={styles.stylistsContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#E75480" />
            <Text style={styles.loadingText}>Finding stylists...</Text>
          </View>
        ) : filteredStylists.length === 0 ? (
          <View style={styles.centerContent}>
            <Ionicons name="search-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No stylists found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search</Text>
          </View>
        ) : (
          <>
            <Text style={styles.resultsText}>
              {filteredStylists.length} stylists available
            </Text>
            {filteredStylists.map((stylist) => (
              <TouchableOpacity
                key={stylist._id}
                style={styles.card}
                onPress={() => router.push({
                  pathname: '/stylist/[id]',
                  params: { id: stylist._id },
                })}
              >
                <View style={styles.cardHeader}>
                  <Image 
                    source={{ 
                      uri: stylist.profileImage || 'https://via.placeholder.com/80' 
                    }} 
                    style={styles.avatar} 
                  />
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={12} color="#FFD700" />
                    <Text style={styles.ratingText}>{stylist.rating}</Text>
                  </View>
                </View>

                <View style={styles.cardBody}>
                  <Text style={styles.name}>{stylist.name}</Text>
                  <Text style={styles.specialty}>
                    {stylist.specialty?.slice(0, 2).join(' • ')}
                  </Text>
                  
                  {stylist.location && (
                    <View style={styles.locationRow}>
                      <Ionicons name="location-outline" size={14} color="#666" />
                      <Text style={styles.locationText}>
                        {stylist.location.city}
                      </Text>
                    </View>
                  )}

                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>From</Text>
                    <Text style={styles.price}>
                      GHS {getLowestPrice(stylist.services)}
                    </Text>
                  </View>

                  <View style={styles.servicesRow}>
                    {stylist.services?.slice(0, 2).map((service) => (
                      <View key={service.id} style={styles.serviceTag}>
                        <Text style={styles.serviceTagText}>{service.name}</Text>
                      </View>
                    ))}
                    {stylist.services?.length > 2 && (
                      <Text style={styles.moreServices}>
                        +{stylist.services.length - 2} more
                      </Text>
                    )}
                  </View>
                </View>

                <TouchableOpacity 
                  style={styles.bookButton}
                  onPress={() => router.push({
                    pathname: '/book/[stylistId]',
                    params: { stylistId: stylist._id },
                  })}
                >
                  <Text style={styles.bookButtonText}>Book Now</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 10,
    backgroundColor: '#fff',
  },
  searchInput: {
    flex: 1,
    height: 46,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#333',
  },
  searchButton: {
    width: 46,
    height: 46,
    backgroundColor: '#E75480',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryContainer: {
    backgroundColor: '#fff',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  categoryContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#E75480',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#fff',
  },
  stylistsContainer: {
    flex: 1,
  },
  stylistsContent: {
    padding: 16,
    paddingBottom: 100,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
    fontSize: 14,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
  },
  resultsText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#F0F0F0',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#B8860B',
  },
  cardBody: {
    marginTop: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  specialty: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
    textTransform: 'capitalize',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  locationText: {
    fontSize: 13,
    color: '#666',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 12,
    gap: 4,
  },
  priceLabel: {
    fontSize: 13,
    color: '#999',
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E75480',
  },
  servicesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  serviceTag: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  serviceTagText: {
    fontSize: 12,
    color: '#666',
  },
  moreServices: {
    fontSize: 12,
    color: '#E75480',
    alignSelf: 'center',
  },
  bookButton: {
    backgroundColor: '#E75480',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
