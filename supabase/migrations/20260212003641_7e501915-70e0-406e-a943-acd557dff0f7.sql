
-- Create trigger to auto-create profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create storage bucket for bot file uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('bot-assets', 'bot-assets', true)
ON CONFLICT DO NOTHING;

-- Storage policies for bot-assets
CREATE POLICY "Anyone can view bot assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'bot-assets');

CREATE POLICY "Authenticated users can upload bot assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'bot-assets' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete own bot assets"
ON storage.objects FOR DELETE
USING (bucket_id = 'bot-assets' AND auth.uid()::text = (storage.foldername(name))[1]);
