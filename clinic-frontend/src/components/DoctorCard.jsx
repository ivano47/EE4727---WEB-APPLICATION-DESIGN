function DoctorCard({ doctor }) {
  return (
    <div className="flex items-center p-4 border rounded-lg shadow-sm mb-4 bg-white hover:shadow-md transition-shadow">
      <img
        src={doctor.image_url || '/images/default-doctor.jpg'}
        alt={doctor.full_name}
        className="h-24 w-24 rounded-full object-cover"
      />
      <div className="ml-4">
        <h3 className="font-heading text-xl font-bold text-primary">
          {doctor.full_name}
        </h3>
        <p className="font-sans font-semibold text-secondary">{doctor.specialty}</p>
        {doctor.bio && (
          <p className="text-gray-600 mt-2">{doctor.bio}</p>
        )}
      </div>
    </div>
  );
}

export default DoctorCard;
