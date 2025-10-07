interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = "Cargando..." }: LoadingScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-primary">
      <div className="card text-center">
        <div className="spinner mx-auto mb-lg"></div>
        <p className="text-lg text-secondary">{message}</p>
      </div>
    </div>
  );
}