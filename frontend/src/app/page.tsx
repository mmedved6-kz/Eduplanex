"use client"; 

import axios from 'axios';
import { useEffect, useState } from 'react';

const Home: React.FC = () => {
    const [message, setMessage] = useState<string>('');

    useEffect(() => {
        const fetchMessage = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/`);
                setMessage(response.data);
            } catch (error) {
                console.error('Error fetching message:', error);
            }
        };

        fetchMessage();
    }, []);

    return (
        <div>
            <h1>Welcome to EduPlanEx</h1>
            <p>Backend Response: {message}</p>
        </div>
    );
};

export default Home;

