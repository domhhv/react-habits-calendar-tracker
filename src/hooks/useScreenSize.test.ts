import { fireEvent, renderHook } from '@testing-library/react';

import useScreenWidth from './useScreenWidth';

describe(useScreenWidth.name, () => {
  it('should return a number', () => {
    const { result } = renderHook(() => useScreenWidth());
    expect(typeof result.current).toBe('number');
  });

  it('should return the window innerWidth', () => {
    (window.innerWidth as number) = 1000;
    const { result } = renderHook(() => useScreenWidth());
    expect(result.current).toEqual(1000);
  });

  it('should update the screen size when the window is resized', () => {
    (window.innerWidth as number) = 1024;
    const { result } = renderHook(() => useScreenWidth());
    expect(result.current).toEqual(1024);
    fireEvent.resize(window, { target: { innerWidth: 1000 } });
    expect(result.current).toEqual(1000);
  });
});
