ALTER TABLE "dealer"
ADD COLUMN "latitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN "longitude" DOUBLE PRECISION NOT NULL;

ALTER TABLE "service_center"
ADD COLUMN "latitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN "longitude" DOUBLE PRECISION NOT NULL;

ALTER TABLE "dealer"
ADD CONSTRAINT "dealer_latitude_range_check"
CHECK ("latitude" BETWEEN -90 AND 90),
ADD CONSTRAINT "dealer_longitude_range_check"
CHECK ("longitude" BETWEEN -180 AND 180);

ALTER TABLE "service_center"
ADD CONSTRAINT "service_center_latitude_range_check"
CHECK ("latitude" BETWEEN -90 AND 90),
ADD CONSTRAINT "service_center_longitude_range_check"
CHECK ("longitude" BETWEEN -180 AND 180);
