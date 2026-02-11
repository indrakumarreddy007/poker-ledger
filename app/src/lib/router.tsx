import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface RouterContextType {
  currentPath: string;
  navigate: (path: string) => void;
  params: Record<string, string>;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

export function RouterProvider({ children }: { children: React.ReactNode }) {
  const [currentPath, setCurrentPath] = useState(window.location.hash.slice(1) || '/');
  const [params, setParams] = useState<Record<string, string>>({});

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPath(window.location.hash.slice(1) || '/');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = useCallback((path: string) => {
    window.location.hash = path;
  }, []);

  // Parse params from path
  useEffect(() => {
    const pathParts = currentPath.split('/');
    const newParams: Record<string, string> = {};
    
    if (pathParts[1] === 'session' && pathParts[2]) {
      newParams.sessionId = pathParts[2];
    }
    
    setParams(newParams);
  }, [currentPath]);

  return (
    <RouterContext.Provider value={{ currentPath, navigate, params }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const context = useContext(RouterContext);
  if (context === undefined) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
}

export function useParams<T extends Record<string, string>>(): T {
  const { params } = useRouter();
  return params as T;
}

interface RouteProps {
  path: string;
  element: React.ReactNode;
}

export function Route({ element }: RouteProps) {
  return <>{element}</>;
}

interface RoutesProps {
  children: React.ReactNode;
}

export function Routes({ children }: RoutesProps) {
  const { currentPath } = useRouter();
  
  const routes = React.Children.toArray(children) as React.ReactElement<RouteProps>[];
  
  for (const route of routes) {
    const { path, element } = route.props;
    
    // Handle exact match
    if (path === currentPath) {
      return <>{element}</>;
    }
    
    // Handle parameterized routes like /session/:sessionId
    if (path.includes(':')) {
      const pathPattern = path.replace(/:\w+/g, '([^/]+)');
      const regex = new RegExp(`^${pathPattern}$`);
      
      if (regex.test(currentPath)) {
        return <>{element}</>;
      }
    }
  }
  
  // Default route (first route or null)
  return null;
}

export function Navigate({ to, replace }: { to: string; replace?: boolean }) {
  const { navigate } = useRouter();
  
  useEffect(() => {
    navigate(to);
  }, [navigate, to]);
  
  return null;
}

export function Link({ 
  to, 
  children, 
  className,
  onClick 
}: { 
  to: string; 
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const { navigate } = useRouter();
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(to);
    onClick?.();
  };
  
  return (
    <a href={`#${to}`} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
