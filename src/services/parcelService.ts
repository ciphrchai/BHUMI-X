export async function getParcels(region?: string): Promise<Parcel[]> {
  if (IS_MOCK_MODE) {
    await delay(300);

    let result = [...mockParcels];

    if (region) {
      const normalizedRegion = region.toLowerCase();

      result = result.filter(
        p =>
          p.study_zone.toLowerCase().includes(normalizedRegion) ||
          p.land_use.toLowerCase().includes(normalizedRegion)
      );
    }

    return result;
  }

  const queryString = region
    ? `?region=${encodeURIComponent(region)}`
    : '';

  return apiRequest<Parcel[]>(
    `/api/parcels${queryString}`
  );
}