# 3D GLB Models Directory

All models from `all models/` have been organized and deployed into their respective folders and wired into the 3D digital twin engine:

```text
frontend/public/models/
│
├── stations/
│   ├── ev_station.glb                          # EnBW Charging Station Model
│   ├── electric_car_charging_station_enbw.glb
│   └── power_box.glb                           # Electrical grid transformer substation
│
├── vehicles/
│   ├── cybertruck.glb                          # Rendered for CyberSedan
│   ├── suv.glb                                 # Rendered for Apex SUV
│   ├── sports_car.glb                          # Rendered for HyperCoupe
│   ├── van.glb                                 # Rendered for FleetVan
│   ├── car.glb, car_sedan.glb, car_model.glb
│   ├── pickup_truck.glb, police_car.glb, convertible.glb
│   ├── taycan.glb, lucid.glb, mercedes_benz_vision_eqs.glb
│   └── truck.glb, bus.glb, bicycle.glb, motorcycle.glb
│
├── city/
│   ├── skyscraper.glb, hotel.glb, apartment.glb, hospital.glb
│   ├── large_building.glb, building.glb, townhouse.glb, signal_tower.glb
│   ├── science_centre.glb, big_building.glb, brown_building.glb
│   ├── tree.glb, bench.glb, traffic_props.glb, cone.glb
│   ├── bus_stop.glb, billboard.glb, traffic_light.glb, stop_sign.glb
│   └── trash_can.glb, dumpster.glb, fire_hydrant.glb, mailbox.glb, atm.glb, planter.glb
│
└── characters/
    ├── worker.glb                              # Service technician at station power box
    ├── casual_character.glb                    # Charging patron waiting near bench
    ├── business_man.glb                        # Pedestrian near Central Plaza
    ├── animated_woman.glb, woman.glb, man.glb, suit.glb, punk.glb
```

All 3D components automatically load these models while preserving high-performance fallbacks and responsive 60 FPS rendering.
