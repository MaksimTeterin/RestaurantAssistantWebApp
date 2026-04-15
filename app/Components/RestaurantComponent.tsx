type RestaurantProps = {
  name: string
  address: string
  phone: string
}

export default function RestaurantComponent({ name, address, phone }: RestaurantProps) {

  return (
  <div className="card bg-base-100 image-full w-full max-w-sm shadow-sm">
  <figure>
    <img
      src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
      alt="Shoes" />
  </figure>
  <div className="card-body">
    <h2 className="card-title">{name}</h2>
    <p>{address}</p>
    <div className="card-actions justify-end">
      <button className="btn btn-primary">{phone}</button>
    </div>
  </div>
</div>
  );
}
