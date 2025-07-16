import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Star, BookOpen, RotateCcw } from 'lucide-react';

interface StarPoint {
  x: number;
  y: number;
  id: string;
  size: number;
  brightness: number;
  clickCount: number;
}

interface Constellation {
  name: string;
  story: string;
  stars: StarPoint[];
}

const StoriesInTheSky: React.FC = () => {
  const [stars, setStars] = useState<StarPoint[]>([]);
  const [constellation, setConstellation] = useState<Constellation | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [showStory, setShowStory] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Generate twinkling background stars
  const [backgroundStars] = useState(() => {
    const bgStars = [];
    for (let i = 0; i < 200; i++) {
      bgStars.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.8 + 0.2,
        delay: Math.random() * 3
      });
    }
    return bgStars;
  });

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (constellation) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Check if clicking near an existing star (within 3% distance)
    const existingStarIndex = stars.findIndex(star => {
      const distance = Math.sqrt(Math.pow(star.x - x, 2) + Math.pow(star.y - y, 2));
      return distance < 3;
    });

    if (existingStarIndex !== -1) {
      // Enlarge existing star
      setStars(prev => prev.map((star, index) => 
        index === existingStarIndex 
          ? { ...star, clickCount: star.clickCount + 1, size: Math.min(star.size + 4, 22) }
          : star
      ));
    } else {
      // Create new star
      const newStar: StarPoint = {
        x,
        y,
        id: Date.now().toString(),
        size: 10,
        brightness: 1,
        clickCount: 1
      };

      setStars(prev => [...prev, newStar]);
    }
  };

  const analyzeConstellation = async () => {
    if (stars.length < 3) {
      alert('Place at least 3 stars to form a constellation!');
      return;
    }

    setIsRevealing(true);

    // Analyze the pattern geometry
    const centerX = stars.reduce((sum, star) => sum + star.x, 0) / stars.length;
    const centerY = stars.reduce((sum, star) => sum + star.y, 0) / stars.length;
    
    const spread = Math.sqrt(
      stars.reduce((sum, star) => sum + Math.pow(star.x - centerX, 2) + Math.pow(star.y - centerY, 2), 0) / stars.length
    );

    const aspectRatio = Math.max(...stars.map(s => s.x)) - Math.min(...stars.map(s => s.x));
    const height = Math.max(...stars.map(s => s.y)) - Math.min(...stars.map(s => s.y));
    
    // Generate constellation name and story based on pattern
    const constellationData = generateConstellation(stars.length, spread, aspectRatio, height, centerX, centerY);
    
    setTimeout(() => {
      setConstellation(constellationData);
      setIsRevealing(false);
    }, 2000);
  };

  const generateConstellation = (numStars: number, spread: number, width: number, height: number, centerX: number, centerY: number): Constellation => {
    const patterns = [
      // Based on star count and geometry
      { min: 3, max: 4, narrow: true, names: ['El Puente Colgante', 'La Escalera Celestial', 'El Triángulo Mágico'] },
      { min: 3, max: 4, narrow: false, names: ['El Gato Dormido', 'El Paraguas Bailarín', 'La Corona Perdida'] },
      { min: 5, max: 6, narrow: true, names: ['El Dragón Volador', 'La Serpiente Sabia', 'El Río de Luz'] },
      { min: 5, max: 6, narrow: false, names: ['El Jardín Secreto', 'La Mariposa Nocturna', 'El Abanico Mágico'] },
      { min: 7, max: 10, narrow: true, names: ['El Collar de Perlas', 'La Espada Legendaria', 'El Camino del Héroe'] },
      { min: 7, max: 10, narrow: false, names: ['La Flor Gigante', 'El Castillo Flotante', 'La Telaraña Dorada'] },
      { min: 11, max: 20, narrow: true, names: ['La Galaxia Perdida', 'El Bosque Eterno', 'La Caravana Estelar'] },
      { min: 11, max: 20, narrow: false, names: ['El Océano Celestial', 'La Ciudad de Cristal', 'El Laberinto Cósmico'] }
    ];

    const isNarrow = width > height * 1.5;
    const pattern = patterns.find(p => numStars >= p.min && numStars <= p.max && p.narrow === isNarrow) || patterns[0];
    const name = pattern.names[Math.floor(Math.random() * pattern.names.length)];

    const stories = {
      'El Puente Colgante': 'Cuenta la leyenda que este puente conecta dos mundos paralelos. Los viajeros que lo cruzan durante la luna llena pueden ver reflejos de sus vidas alternativas en las aguas cósmicas que fluyen debajo.',
      'La Escalera Celestial': 'Los antiguos creían que esta escalera permitía a las almas ascender hacia la eternidad. Cada peldaño representa una lección aprendida en la vida terrenal.',
      'El Triángulo Mágico': 'Tres magos legendarios unieron sus poderes para crear esta formación estelar. Su geometría perfecta mantiene el equilibrio entre la luz y la oscuridad.',
      'El Gato Dormido': 'Este felino celestial duerme eternamente, y se dice que sus ronroneos crean las melodías que escuchamos en el viento nocturno.',
      'El Paraguas Bailarín': 'Durante las tormentas cósmicas, este paraguas baila graciosamente, protegiendo a los soñadores de pesadillas mientras duermen.',
      'La Corona Perdida': 'Una corona que perteneció a la reina de las estrellas, perdida durante una batalla épica. Quien la encuentre heredará la sabiduría de los cielos.',
      'El Dragón Volador': 'Un dragón benévolo que guía a los navegantes perdidos hacia su hogar. Su vuelo eterno marca las rutas seguras del universo.',
      'La Serpiente Sabia': 'Guardiana de secretos ancestrales, esta serpiente susurra conocimientos antiguos a quienes saben escuchar el silencio.',
      'El Río de Luz': 'Un río celestial donde fluyen los sueños y esperanzas de todos los seres. Sus aguas nunca se secan y siempre reflejan la verdad.',
      'El Jardín Secreto': 'Un jardín donde florecen las emociones más puras. Solo aquellos con corazón sincero pueden ver sus flores brillar.',
      'La Mariposa Nocturna': 'Transformación y renacimiento son sus dones. Su vuelo nocturno lleva mensajes entre las almas gemelas.',
      'El Abanico Mágico': 'Con cada movimiento, este abanico trae brisas de buena fortuna y ahuyenta los malos augurios.',
      'El Collar de Perlas': 'Cada perla contiene un momento de felicidad pura. Juntas forman una cadena de alegría infinita.',
      'La Espada Legendaria': 'Forjada con luz estelar, esta espada corta las cadenas del destino y libera a quienes buscan su verdadero camino.',
      'El Camino del Héroe': 'El sendero que debe recorrer todo héroe verdadero. Cada estrella marca una prueba superada con honor.',
      'La Flor Gigante': 'Una flor que florece solo durante los eclipses. Su fragancia puede curar corazones rotos y almas perdidas.',
      'El Castillo Flotante': 'Hogar de los guardianes del tiempo, este castillo protege los momentos más preciados de la historia.',
      'La Telaraña Dorada': 'Tejida por las arañas cósmicas, esta red conecta todos los destinos y mantiene unido el tejido del universo.',
      'La Galaxia Perdida': 'Una galaxia que desapareció hace milenios, pero sus ecos aún resuenan en forma de esta constelación.',
      'El Bosque Eterno': 'Árboles de luz que nunca mueren, donde habitan las almas de los protectores de la naturaleza.',
      'La Caravana Estelar': 'Mercaderes celestiales que viajan entre mundos, llevando esperanza y comerciando con sueños.',
      'El Océano Celestial': 'Vastas aguas donde nadan las ballenas cósmicas, cantando canciones que mantienen la armonía universal.',
      'La Ciudad de Cristal': 'Una metrópolis transparente donde viven los arquitectos del futuro, diseñando realidades por venir.',
      'El Laberinto Cósmico': 'Un laberinto sin fin donde cada camino lleva a una nueva dimensión de posibilidades infinitas.'
    };

    return {
      name,
      story: stories[name as keyof typeof stories] || 'Una formación misteriosa que guarda secretos del cosmos.',
      stars
    };
  };

  const resetCanvas = () => {
    setStars([]);
    setConstellation(null);
    setShowStory(false);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 relative overflow-hidden flex flex-col">
      {/* Animated Background Stars */}
      <div className="absolute inset-0">
        {backgroundStars.map((star, index) => (
          <div
            key={index}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              animationDelay: `${star.delay}s`,
              animationDuration: '3s'
            }}
          />
        ))}
      </div>

      {/* Cosmic Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 via-transparent to-indigo-900/20 pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 p-4 flex-shrink-0">
        <div className="backdrop-blur-md bg-white/10 rounded-2xl border border-white/20 p-3 max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-white text-center font-['Quicksand'] flex items-center justify-center gap-2">
            <Sparkles className="text-yellow-300" />
            Stories in the Sky
          </h1>
          <p className="text-purple-200 text-center mt-1 font-['Quicksand'] text-sm">
            Click to place stars and discover your constellation
          </p>
        </div>
      </div>

      {/* Main Canvas */}
      <div 
        ref={canvasRef}
        className="relative flex-1 cursor-crosshair min-h-0"
        onClick={handleCanvasClick}
      >
        {/* User-placed stars */}
        {stars.map((star) => (
          <div 
            key={star.id} 
            className="absolute pointer-events-none"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: 10,
            }}
          >
            {/* Main bright star point */}
            <div
              className="rounded-full bg-white animate-pulse"
              style={{
                width: `${star.size}px`,
                height: `${star.size}px`,
                boxShadow: `
                  0 0 ${star.size * 0.5}px #fff,
                  0 0 ${star.size * 1}px #fff,
                  0 0 ${star.size * 2}px rgba(255, 255, 255, 0.8),
                  0 0 ${star.size * 3}px rgba(255, 255, 255, 0.4)
                `,
                border: '1px solid rgba(255, 255, 255, 0.8)',
              }}
            />
          </div>
        ))}

        {/* Constellation lines */}
        {constellation && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {constellation.stars.map((star, index) => {
              if (index === constellation.stars.length - 1) return null;
              const nextStar = constellation.stars[index + 1];
              return (
                <line
                  key={`line-${index}`}
                  x1={`${star.x}%`}
                  y1={`${star.y}%`}
                  x2={`${nextStar.x}%`}
                  y2={`${nextStar.y}%`}
                  stroke="rgba(255, 255, 255, 0.6)"
                  strokeWidth="1"
                  className="animate-pulse"
                  style={{
                    filter: 'drop-shadow(0 0 3px rgba(255, 255, 255, 0.3))',
                  }}
                />
              );
            })}
          </svg>
        )}

        {/* Revealing animation */}
        {isRevealing && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="backdrop-blur-md bg-white/10 rounded-2xl border border-white/20 p-8 max-w-md mx-auto">
              <div className="text-center">
                <Sparkles className="text-yellow-300 w-12 h-12 mx-auto animate-spin mb-4" />
                <p className="text-white text-xl font-['Quicksand']">
                  Revealing your constellation...
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="relative z-10 p-4 flex-shrink-0">
        <div className="flex flex-col items-center gap-3">
          {/* Control Buttons */}
          <div className="flex gap-3">
            <button
              onClick={analyzeConstellation}
              disabled={stars.length < 3 || isRevealing || !!constellation}
              className="backdrop-blur-md bg-purple-600/20 hover:bg-purple-600/30 disabled:bg-gray-600/20 disabled:cursor-not-allowed border border-purple-400/30 rounded-xl px-4 py-2 text-white font-['Quicksand'] transition-all duration-200 flex items-center gap-2 text-sm"
            >
              <Star className="w-4 h-4" />
              Reveal Constellation
            </button>

            <button
              onClick={resetCanvas}
              className="backdrop-blur-md bg-red-600/20 hover:bg-red-600/30 border border-red-400/30 rounded-xl px-4 py-2 text-white font-['Quicksand'] transition-all duration-200 flex items-center gap-2 text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>

          {/* Constellation Info */}
          {constellation && (
            <div className="backdrop-blur-md bg-white/10 rounded-2xl border border-white/20 p-4 max-w-2xl mx-auto">
              <h2 className="text-xl font-bold text-purple-300 text-center mb-3 font-['Quicksand']">
                {constellation.name}
              </h2>
              
              <div className="text-center mb-3">
                <button
                  onClick={() => setShowStory(!showStory)}
                  className="backdrop-blur-md bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-400/30 rounded-xl px-3 py-1 text-white font-['Quicksand'] transition-all duration-200 flex items-center gap-2 mx-auto text-sm"
                >
                  <BookOpen className="w-4 h-4" />
                  {showStory ? 'Hide Story' : 'Show Story'}
                </button>
              </div>

              {showStory && (
                <div className="text-purple-100 leading-relaxed font-['Quicksand'] text-center text-sm">
                  {constellation.story}
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="text-center text-purple-300 font-['Quicksand'] max-w-md text-sm">
            {stars.length === 0 && "Click anywhere to place your first star"}
            {stars.length > 0 && stars.length < 3 && `${stars.length} stars placed. Need at least 3 to form a constellation.`}
            {stars.length >= 3 && !constellation && `${stars.length} stars placed. Ready to reveal your constellation!`}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoriesInTheSky;