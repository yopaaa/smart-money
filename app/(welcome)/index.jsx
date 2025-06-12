import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

const slides = [
  {
    title: 'Financial monitoring',
    description: 'Keep your incomes and expenses on track',
    illustration: 'financial',
  },
  {
    title: 'Smart Analytics',
    description: 'Get insights from your spending patterns',
    illustration: 'analytics',
  },
  {
    title: 'Secure Payments',
    description: 'Safe and encrypted transactions',
    illustration: 'security',
  },
];

export default function FinancialOnboardingScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollRef = useRef(null);
  const router = useRouter();

  const goToSlide = (index) => {
    scrollRef.current.scrollTo({ x: index * width, animated: true });
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    const nextIndex = (currentSlide + 1) % slides.length;
    goToSlide(nextIndex);
  };

  const prevSlide = () => {
    const prevIndex = (currentSlide - 1 + slides.length) % slides.length;
    goToSlide(prevIndex);
  };

  const handleScroll = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentSlide(index);
  };

  const renderIllustration = (type) => {
    switch (type) {
      case 'financial':
        return <View style={styles.illustrationBox}><Text>📊 Financial Chart</Text></View>;
      case 'analytics':
        return <View style={styles.illustrationBox}><Text>📈 Analytics</Text></View>;
      case 'security':
        return <View style={styles.illustrationBox}><Text>🔐 Security Lock</Text></View>;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Swiper area */}
      <View style={styles.sliderContainer}>
        <TouchableOpacity style={styles.arrowButton} onPress={prevSlide}>
          <Text style={styles.arrowText}>←</Text>
        </TouchableOpacity>

        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          ref={scrollRef}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {slides.map((slide, index) => (
            <View key={index} style={styles.slide}>
              {renderIllustration(slide.illustration)}
            </View>
          ))}
        </ScrollView>

        <TouchableOpacity style={[styles.arrowButton, { right: 0 }]} onPress={nextSlide}>
          <Text style={styles.arrowText}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Title and description */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>{slides[currentSlide].title}</Text>
        <Text style={styles.description}>{slides[currentSlide].description}</Text>
      </View>

      {/* Indicator */}
      <View style={styles.indicatorContainer}>
        {slides.map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => goToSlide(index)}
            style={[
              styles.indicatorDot,
              currentSlide === index && styles.activeDot,
            ]}
          />
        ))}
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.getStartedButton} onPress={() => {
          router.push("/Account")
        }}>
          <Text style={styles.getStartedText}>GET STARTED</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.restoreText}>RESTORE DATA</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    justifyContent: "center"
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
  },
  slide: {
    width: width - 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  arrowButton: {
    position: 'absolute',
    // left: 0,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    elevation: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    fontSize: 18,
    color: '#666',
  },
  illustrationBox: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    elevation: 4,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    maxWidth: 300,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#3B82F6',
  },
  buttonContainer: {
    // marginTop: 'auto',
    gap: 12,
  },
  getStartedButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  getStartedText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  restoreText: {
    textAlign: 'center',
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '500',
  },
});
