import { render } from '@testing-library/react';
import { useStorage } from '../../hooks';
import { useNavigate } from 'react-router-dom';
import { Root } from '../root';
import { jest } from '@jest/globals';

jest.mock('../hooks', () => ({
    useStorage: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
    useNavigate: jest.fn(),
}));

describe('Root Component', () => {
    const mockNavigate = jest.fn();
    const mockStorage = {
        get: jest.fn(),
        set: jest.fn(),
        remove: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();

        (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
        (useStorage as jest.Mock).mockReturnValue(mockStorage);
    });

    it('should redirect to /login when no session exists', () => {
        mockStorage.get.mockReturnValue(null);
        render(<Root />);

        expect(mockStorage.get).toHaveBeenCalledWith('session');
        expect(mockNavigate).toHaveBeenCalledWith('/login');
        expect(mockNavigate).not.toHaveBeenCalledWith('/posts');
    });

    it('should redirect to /posts when session exists', () => {
        mockStorage.get.mockReturnValue(
            JSON.stringify({
                token: 'test-token',
                userId: '123',
            }),
        );

        render(<Root />);

        expect(mockStorage.get).toHaveBeenCalledWith('session');
        expect(mockNavigate).toHaveBeenCalledWith('/posts');
        expect(mockNavigate).not.toHaveBeenCalledWith('/login');
    });

    it('should check session only once on initial render', () => {
        mockStorage.get.mockReturnValue(null);
        render(<Root />);

        expect(mockStorage.get).toHaveBeenCalledTimes(1);
    });
});
