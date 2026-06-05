import axios from 'axios';

async function test() {
  const API_URL = 'https://beta-api.hoctuthien.com/api/v1';
  console.log('1. Logging in to:', `${API_URL}/auths/login`);
  try {
    const loginRes = await axios.post(`${API_URL}/auths/login`, {
      email: 'testuser1@example.com',
      password: 'password123'
    });
    
    // Extract token from response data array
    const token = loginRes.data?.data?.[0]?.access_token;
    console.log('Login successful. Token length:', token ? token.length : 0);
    
    if (!token) {
      console.log('Full login response:', JSON.stringify(loginRes.data, null, 2));
      throw new Error('No access token found in response.');
    }

    const payload = {
      title: "Nhập môn lập trình (C/C++)",
      description: "Giúp các bạn tiếp cận với lập trình",
      categoryIds: ["e6f36141-f5b8-4ee0-9d7c-05fdff1a574a"],
      price: 5000,
      durationMinutes: 60,
      prerequisites: [],
      status: "ACTIVE",
      thumbnailUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop",
      metadata: {
        categoryName: "C/C++",
        rating: 0,
        reviewsCount: 0,
        studentsCount: 0,
        level: "beginner",
        totalHours: 1,
        format: "online",
        time: {
          monday: [],
          tuesday: [],
          wednesday: [],
          thursday: [],
          friday: ["15:30-16:30"],
          saturday: [],
          sunday: []
        }
      }
    };

    console.log('\n2. Sending POST to:', `${API_URL}/courses`);
    console.log('Payload:', JSON.stringify(payload, null, 2));

    try {
      const createRes = await axios.post(`${API_URL}/courses`, payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('\nSUCCESS! Status:', createRes.status);
      console.log('Response data:', JSON.stringify(createRes.data, null, 2));
    } catch (err: any) {
      console.log('\nFAILED! Status:', err.response?.status);
      console.log('Response error data:', JSON.stringify(err.response?.data, null, 2));
    }

  } catch (err: any) {
    console.error('Error during test execution:', err.message || err);
    if (err.response) {
      console.error('Login Error Response:', JSON.stringify(err.response.data, null, 2));
    }
  }
}

test();
