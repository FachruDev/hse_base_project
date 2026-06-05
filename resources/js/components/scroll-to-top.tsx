import { ArrowUp } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';

export function ScrollToTop() {
    const [isVisible, setIsVisible] = React.useState(false);
    const [isHovered, setIsHovered] = React.useState(false);
    const [isIdle, setIsIdle] = React.useState(false);
    
    const idleTimerRef = React.useRef<NodeJS.Timeout | null>(null);

    React.useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
            
            setIsIdle(false);
            if (idleTimerRef.current) {
                clearTimeout(idleTimerRef.current);
            }
            
            idleTimerRef.current = setTimeout(() => {
                setIsIdle(true);
            }, 2500); 
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll();

        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (idleTimerRef.current) {
                clearTimeout(idleTimerRef.current);
            }
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    if (!isVisible) {
        return null;
    }

    return (
        <div
            className={`fixed bottom-8 right-0 z-50 transition-all duration-500 ease-in-out ${
                isIdle && !isHovered ? 'translate-x-[40%] opacity-60' : '-translate-x-6 opacity-100'
            }`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Button
                variant="default"
                size="icon"
                className="h-12 w-12 rounded-full shadow-lg transition-transform hover:scale-110 active:scale-95"
                onClick={scrollToTop}
            >
                <ArrowUp className="size-5" />
            </Button>
        </div>
    );
}
