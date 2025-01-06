import axios from 'axios';
import { useEffect, useState } from 'react';

export default function Home() {
    const [message, setMessage] = useState('');

    useEffect(() => {
        axios.get('http://localhost:5000/')
            .then((response) => {
                setMessage(response.data);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }, []);

    return (
        <div>
            <h1>Welcome to EduPlanEx</h1>
            <p>Backend Response: {message}</p>
        </div>
    );
}

