import { supabase } from '../supabaseClient';

function DoctorCard({ doctor }) {
  console.log('DoctorCard received doctor:', doctor);
  let publicURL = { publicUrl: '/images/default-doctor.jpg' };
  if (doctor.avatar_url) {
    const { data } = supabase
      .storage
      .from('avatars')
      .getPublicUrl(doctor.avatar_url);
    publicURL = data;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 text-center transition-all hover:shadow-xl h-full">
      <img
        src={publicURL.publicUrl || '/images/default-doctor.jpg'}
        alt={doctor.full_name}
        className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-gray-100"
      />
      <h3 className="font-heading text-xl font-bold text-primary mt-4">
        {doctor.full_name}
      </h3>
      <p className="font-sans font-semibold text-secondary">{doctor.specialty}</p>
      {doctor.bio && (
        <p className="text-gray-600 mt-2 text-sm">{doctor.bio}</p>
      )}
    </div>
  );
}

export default DoctorCard;
