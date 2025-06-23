# Supabase Storage Setup Instructions

## Create Storage Bucket

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/clwluvdlgsrfldvivqhy
2. Navigate to Storage section
3. Create a new bucket called `card-images`
4. Set bucket to **Public** access (since generated card images will be publicly viewable)

## Storage Policies

The Edge Functions will handle file uploads, but you need to set the following RLS policies for the storage bucket:

### Allow authenticated users to upload images

```sql
CREATE POLICY "Users can upload own card images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'card-images' AND 
  auth.role() = 'authenticated'
);
```

### Allow public read access to card images

```sql
CREATE POLICY "Public access to card images" ON storage.objects
FOR SELECT USING (bucket_id = 'card-images');
```

### Allow users to update their own images

```sql
CREATE POLICY "Users can update own card images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'card-images' AND 
  auth.role() = 'authenticated'
);
```

### Allow users to delete their own images

```sql
CREATE POLICY "Users can delete own card images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'card-images' AND 
  auth.role() = 'authenticated'
);
```

## File Structure

Generated images will be stored with the following structure:
```
card-images/
  └── cards/
      └── {card_id}/
          └── {timestamp}.png
```

This ensures each card can have multiple image versions and they're organized by card ID.

## Image Settings

- **Format**: PNG (for transparency support)
- **Size**: 1024x1024 (DALL-E 3 standard)
- **Quality**: Standard for free tier, HD for premium+ tiers
- **Max file size**: 10MB per image