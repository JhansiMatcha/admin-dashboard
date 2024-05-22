// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'https://openlibrary.org/';

// Function to fetch books
export const fetchBooks = async (query = 'book', page = 1, limit = 10) => {
    try {
        const response = await axios.get(`${API_BASE_URL}search.json`, {
            params: {
                title: query,
                page: page,
                limit: limit
            }
        });
        return response.data.docs;
    } catch (error) {
        console.error('Error fetching books:', error);
        throw error;
    }
};

// Function to fetch detailed book information by work ID
export const fetchBookDetails = async (workID) => {
    try {
        const response = await axios.get(`${API_BASE_URL}works/${workID}.json`);
        return response.data;
    } catch (error) {
        console.error('Error fetching book details:', error);
        throw error;
    }
};

