-- Insert data into account table --
INSERT INTO public.account (account_firstname, account_lastname, account_email, account_password)
VALUES ('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n');

-- Update --
UPDATE public.account
SET account_type = 'Admin'
WHERE account_email = 'tony@starkent.com';

-- Delete --
DELETE FROM public.account
WHERE account_email = 'tony@starkent.com';

-- Replace and Update inventory table --
UPDATE public.inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_id = 10
  AND inv_make = 'GM'
  AND inv_model = 'Hummer'
  AND inv_year = '2016';

-- Join make and models --
SELECT inv.inv_make, inv.inv_model, cls.classification_name
FROM public.inventory inv
INNER JOIN public.classification cls
  ON inv.classification_id = cls.classification_id
WHERE cls.classification_name = 'Sport';

-- Update /vehicles file path --
UPDATE public.inventory
SET inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');
