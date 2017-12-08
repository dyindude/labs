# linux 201-lvm
By the end of this lab, you should have an understanding of the following:

- `lvm` structure
  - `pv` (Physical Volumes)
  - `vg` (Volume Groups)
  - `lv` (Logical Volumes)
- Advantages of LVM vs more traditional disk partitioning methods
- Common tasks utilizing LVM
  - Adding a disk
  - Extending existing disk space
  - Identifying physical disk LVM counterparts (I know how to do this in VMware, but maybe not vbox..we'll see)
- Uncommon tasks utilizing LVM
  - Shrinking a root volume size
  - LVM snapshots
  - Renaming a logical volume

# Setup
- If you haven't already, follow the instructions in https://github.com/dyindude/vagrant-lab to install VirtualBox and Vagrant
- Download a copy of this repo, navigate to its folder and run `vagrant up`, followed by `vagrant ssh`
- You'll now be in a shell of a virtual machine configured for this lab.
- Many of the examples in this lab will require root access, so please run `sudo -i` after you gain shell access to the VM
- When you're done, if something in the lab messes up, or you just want to restart from scratch, type `exit` in the terminal to leave the SSH connection and run `vagrant destroy` from the project folder 

# `lvm` Structure
## `pv` (Physical Volume)
A `pv` is a logical representation of a physical block device. They can be created on any standard block device, such as an entire disk (`/dev/sdc`), a partition (`/dev/sdc3`), or a file.

- `pvcreate` is the command used to initialize a block device for use with `lvm`.

    ```
    # pvcreate /dev/sdc  # entire disk
    # pvcreate /dev/sdc3 # single partition
    # dd if=/dev/zero of=/tmp/file.bin bs=1024 count=1024 && pvcreate /tmp/file.bin # physical volume created on top of a normal file in another filesystem
    ```

- `pvs` can be used to report general information about the physical volumes the `lvm` daemon on the system is aware of.

	```
	# pvs /dev/sdc
	  PV         VG   Fmt  Attr PSize PFree
	  /dev/sdc        lvm2 ---  2.00g 2.00g
	  /dev/sdd        lvm2 ---  2.00g 2.00g
	  /dev/sde        lvm2 ---  2.00g 2.00g
	  /dev/sdf        lvm2 ---  2.00g 2.00g
	```

- `pvdisplay` can be used to display more specific information about an individual physical volume

	```
	# pvdisplay /dev/sdc
	  "/dev/sdc" is a new physical volume of "2.00 GiB"
	  --- NEW Physical volume ---
	  PV Name               /dev/sdc
	  VG Name               
	  PV Size               2.00 GiB
	  Allocatable           NO
	  PE Size               0   
	  Total PE              0
	  Free PE               0
	  Allocated PE          0
	  PV UUID               tdFeE5-1gzr-ujEB-0wfe-NQfy-y8Pw-hrpmme
	```

## `vg` (Volume Group)
A `vg` is a collection of one or more `pv`, assigned to a logical group. A `vg` will have a list of `pv` assigned to it, as well as a name created that can be used to reference the entire group with other commands.

- `vgcreate` is used to create a new `vg` with one or more `pv`:

	```
	# vgcreate groupname /dev/sdc /dev/sde
	  Volume group "groupname" successfully created
	```

- `vgs` is used to report general information about all of the volume groups the `lvm` daemon on the system is aware of.

	```
	# vgs
	  VG        #PV #LV #SN Attr   VSize VFree
	  group2      2   0   0 wz--n- 3.99g 3.99g
	  groupname   2   0   0 wz--n- 3.99g 3.99g
	```

- `vgdisplay` will provide more specific information about an individual volume group:

	```
	# vgdisplay groupname
	  --- Volume group ---
	  VG Name               groupname
	  System ID             
	  Format                lvm2
	  Metadata Areas        2
	  Metadata Sequence No  1
	  VG Access             read/write
	  VG Status             resizable
	  MAX LV                0
	  Cur LV                0
	  Open LV               0
	  Max PV                0
	  Cur PV                2
	  Act PV                2
	  VG Size               3.99 GiB
	  PE Size               4.00 MiB
	  Total PE              1022
	  Alloc PE / Size       0 / 0   
	  Free  PE / Size       1022 / 3.99 GiB
	  VG UUID               Lp4PEs-lX2v-fl2s-dkzs-o05g-kFFD-wnnnyT
	```

Volume groups organize the data across the physical volumes into blocks called physical extents.

In the output of `vgdisplay`, physical extents are abbreviated `PE`. Here's what we know from the above output of `vgdisplay`:

- The amount of data associated with a single `PE` in this volume group is `4.00 MiB`.
- The total number of `PE` available within all of the physical volumes associated with this volume group is `1022`.
- The total storage for this volume group is `3.99GB`
- Since we have not `Alloc`ated any extents to logical volumes yet, there are `1022 PE` left to allocate, totalling `3.99GB`

## `lv` (Logical Volume)
A `lv` is a logical representation of a slice of data from a volume group. This can be as small as a single extent, or as large as the number of available extents left in a volume group. After a logical volume has been created, it can be treated as though it was any other block device.

- `lvcreate` is used to create new logical volumes. In this example, we'll create a logical volume named `vol0` in volume group `groupname`, allocating it with all available extents in the volume group. This will create a logical volume that spans both of the disks in the volume group that can be treated as a single block device.

    ```
    # lvcreate -l +100%FREE -n vol0 groupname
      Logical volume "vol0" created.
    ```

    Checking the output of `vgdisplay groupname` again, you'll see that the values in the `Alloc PE` and `Free PE` fields have changed:

    ```
    # vgdisplay groupname
    ...
      Alloc PE / Size       1022 / 3.99 GiB
      Free  PE / Size       0 / 0
      VG UUID               Lp4PEs-lX2v-fl2s-dkzs-o05g-kFFD-wnnnyT
    ```

- `lvs` is used to report general information about all of the logical volumes the `lvm` daemon on the system is aware of.

	```
	# lvs
	  LV   VG        Attr       LSize Pool Origin Data%  Meta%  Move Log Cpy%Sync Convert
	  vol1 group2    -wi-a----- 3.99g
	  vol0 groupname -wi-a----- 3.99g
	```

- `lvdisplay` will provide more specific information about an individual logical volume:

	```
	# lvdisplay /dev/groupname/vol0 
	  --- Logical volume ---
	  LV Path                /dev/groupname/vol0
	  LV Name                vol0
	  VG Name                groupname
	  LV UUID                WEWnlP-QPVu-3GPY-kIld-cJQb-xmEh-UBJV4h
	  LV Write Access        read/write
	  LV Creation host, time shell-lab101, 2017-12-08 03:21:13 +0000
	  LV Status              available
	  # open                 0
	  LV Size                3.99 GiB
	  Current LE             1022
	  Segments               2
	  Allocation             inherit
	  Read ahead sectors     auto
	  - currently set to     256
	  Block device           252:0
	```

    You'll notice that the `Current LE` (logical extents) field shows the same number of extents that we assigned to the logical volume when it was created.

# Trivia


