# linux 201-lvm
`lvm` is a suite of utilities and a system daemon used to abstract physical block devices and create logical block devices from slices of data (known as extents) on each physical block device. The logical block devices managed by `lvm` can be used by other system utilities in the same way as any other block device.

By the end of this lab, you should have an understanding of how disk management works when using `lvm`. The `Vagrantfile` provided with this lab stands up a single Ubuntu system with four blank 2GB disks.

This lab assumes you have some familiarity with working with block devices in Linux software distributions, particularly creating filesystems, mounting them, etc.

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

- `lvdisplay` will provide more specific information about an individual logical volume. The path you can access the logical block device for the volume is under `/dev/[VG]/[PV]`:

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

# Exercise 1
Now that you've seen how all these commands can be used together, gain shell access on the machine provided with this lab by running `vagrant ssh`.

- Become `root` by running `sudo -i`
- Run `fdisk -l` to see the available drives on the system.
  - The following drives are blank 2GB disks you can use with this exercise:
    `/dev/sdc`
    `/dev/sdd`
    `/dev/sde`
    `/dev/sdf`
  - Avoid using `/dev/sda` or `/dev/sdb` (as they are provided by the Vagrant box used for this lab)

- Select two of the disks, and create physical volumes with them using `pvcreate`
- Run `pvs` to see the information about your new PVs, and the amount of data available with them.
- Run `pvdisplay` on both volumes.
- Add these two disks to a volume group with `vgcreate`. Choose your own name.
- Run `vgs`
- Run `vgdisplay` on your volume group's name
- Create a logical volume spanning the entire free space available in your volume group. Again, choose your own name for this, and remember to use the volume group name that you defined earlier.
- Create an ext4 filesystem on the logical volume and mount it to `/mnt`
- run `df -h /mnt` to see the available free space on the new filesystem.

# Adding block devices to logical volumes
One of the advantages of using `lvm` for managing block devices is that it allows you to change the structure of the underlying block device and filesystem, often without having to unmount the volume or restart the system (as is the case when working with physical block devices).

- `vgextend` can be used to add more physical volumes to an existing volume group:

	```
	# vgextend groupname /dev/sdd
	  Volume group "groupname" successfully extended
	```
    
    After making this change, the output of `vgs` and `vgdisplay` will show there are now more extents available in the volume group:

	```
	# vgs
	  VG        #PV #LV #SN Attr   VSize VFree
	  groupname   3   1   0 wz--n- 5.99g 2.00g
	# vgdisplay groupname
	  --- Volume group ---
	  VG Name               groupname
	  System ID             
	  Format                lvm2
	  Metadata Areas        3
	  Metadata Sequence No  3
	  VG Access             read/write
	  VG Status             resizable
	  MAX LV                0
	  Cur LV                1
	  Open LV               1
	  Max PV                0
	  Cur PV                3
	  Act PV                3
	  VG Size               5.99 GiB
	  PE Size               4.00 MiB
	  Total PE              1533
	  Alloc PE / Size       1022 / 3.99 GiB
	  Free  PE / Size       511 / 2.00 GiB
	  VG UUID               wqNgUq-n9Qo-jh0F-bqth-GQpK-68gF-IQiqUK
	```
    
    With these extra extents, existing logical volumes can be extended further onto them with `lvextend`, or new logical volumes can be created within the extents using `lvcreate`.

	```
	# lvextend -l+100%FREE /dev/groupname/vol0 
	  Size of logical volume groupname/vol0 changed from 3.99 GiB (1022 extents) to 5.99 GiB (1533 extents).
	  Logical volume vol0 successfully resized.
	```

	Note that this only resizes the logical block device, and not the filesystem that has been created on top of it. After growing the size of a logical volume, in order to utilize that data on a system, you would still need to grow the filesystem as well:

	```
	# resize2fs /dev/groupname/vol0 
	resize2fs 1.42.13 (17-May-2015)
	Filesystem at /dev/groupname/vol0 is mounted on /mnt; on-line resizing required
	old_desc_blocks = 1, new_desc_blocks = 1
	The filesystem on /dev/groupname/vol0 is now 1569792 (4k) blocks long.
	```

# Exercise 2
Starting from where you left off after Exercise 1:

- Use `pvs` to determine which disks you've already turned into physical volumes.
- Use `pvcreate` to create another physical volume
- Use `vgextend` to add this physical volume to your volume group
- Use `lvextend` to extend the size of the logical volume to include the new extents added by the new disk
- Resize the filesystem of your logical volume
- Use `pvcreate` to create a physical volume with the remaining disk.
- Add the remaining disk to the volume group
- Use `lvcreate` to create another logical volume within your volume group
- Create a filesystem on the new logical volume, create the folder /mnt2 and mount the new volume to that location.
- run `df -h /mnt2` to see the free space on the new logical volume

# Removing block devices from logical volumes
Just as it is possible to add new disks to existing volume group, it's also possible to remove disks using `vgreduce`. However, there are a few implications of this:
- If a logical volume has extents that reside on the physical volume you are trying to remove, `vgreduce` will warn you and prevent you from removing the physical volume from the group. In the next exercise, we'll address this by shrinking the logical volume before removing the physical volume from the group.
- If a filesystem exists on top of a logical volume that is to be reduced in size, you also risk data loss if the filesystem is not shrank to the resulting size before the logical volume is reduced in size. In the next exercise, we'll address this by shrinking the filesystem before shrinking the logical volume.

# Exercise 3
Starting from where you left off after Exercise 2:

- There can be some minor variances in the sizes of ext4 filesystems versus logical volumes when they are created. To account for this, shrink the filesystem to a size slightly smaller than two of the disks in your three disk logical volume:

    ```
    # umount /mnt
    # fsck -f /dev/groupname/vol0
    fsck from util-linux 2.27.1
    e2fsck 1.42.13 (17-May-2015)
    Pass 1: Checking inodes, blocks, and sizes
    Pass 2: Checking directory structure
    Pass 3: Checking directory connectivity
    Pass 4: Checking reference counts
    Pass 5: Checking group summary information
    /dev/mapper/groupname-vol0: 11/392448 files (0.0% non-contiguous), 43070/1569792 blocks
    # resize2fs /dev/groupname/vol0 3800M
    resize2fs 1.42.13 (17-May-2015)
    Resizing the filesystem on /dev/groupname/vol0 to 972800 (4k) blocks.
    The filesystem on /dev/groupname/vol0 is now 972800 (4k) blocks long.
    ```

- Now, shrink the size of your logical volume by the number of extents available on a single disk. Use `pvdisplay` to find this size. 

	```
	# lvreduce /dev/groupname/vol0 -l -511
	  WARNING: Reducing active logical volume to 3.99 GiB
	  THIS MAY DESTROY YOUR DATA (filesystem etc.)
	Do you really want to reduce vol0? [y/n]: y
	  Size of logical volume groupname/vol0 changed from 5.99 GiB (1533 extents) to 3.99 GiB (1022 extents).
	  Logical volume vol0 successfully resized.
	```

- Remount your logical volume to `/mnt`, and check the free space:
    
    ```
	# df -h /mnt
	Filesystem               Size  Used Avail Use% Mounted on
	/dev/mapper/group0-vol0  3.6G  8.0M  3.4G   1% /mnt
	```

    Data loss has been avoided, as the filesystem has been shrank to a size smaller than the new logical volume size (prior to shrinking the logical volume).

- Resize the filesystem again to the full size of the logical volume:

	```
	# resize2fs /dev/group0/vol0 
	resize2fs 1.42.13 (17-May-2015)
	Filesystem at /dev/group0/vol0 is mounted on /mnt; on-line resizing required
	old_desc_blocks = 1, new_desc_blocks = 1
	The filesystem on /dev/group0/vol0 is now 1046528 (4k) blocks long.

	# df -h /mnt
	Filesystem               Size  Used Avail Use% Mounted on
	/dev/mapper/group0-vol0  3.9G  8.0M  3.7G   1% /mnt
	```

- Use `pvdisplay` to find the physical volume that now has only Free extents:

    ```
	  --- Physical volume ---
	  PV Name               /dev/sde
	  VG Name               group0
	  PV Size               2.00 GiB / not usable 4.00 MiB
	  Allocatable           yes 
	  PE Size               4.00 MiB
	  Total PE              511
	  Free PE               511
	  Allocated PE          0
	  PV UUID               XvIfXy-tarY-dxwz-l1SS-ZgeU-Moj5-2OBu2i
    ```

    This disk is safe to remove from the volume group because this volume's `Free PE` matches its `Total PE`. There is no data associated with any logical volume on that physical volume.

- Use `vgreduce` to remove the target drive from the volume group:

    ```
	# vgreduce group0 /dev/sde
	  Removed "/dev/sde" from volume group "group0"
	```

# Moving logical volumes to different Physical Volumes
In the last exercise, it's important to grasp that while `Volume Groups` are logical groupings of `Physical Volumes`, the data associated with a `Logical Volume` is mapped to Physical Extents on `Physical Volumes` within the group.

Take a look at the output of `pvdisplay -m`

```
# pvdisplay -m
  --- Physical volume ---
  PV Name               /dev/sdc
  VG Name               group0
  PV Size               2.00 GiB / not usable 4.00 MiB
  Allocatable           yes (but full)
  PE Size               4.00 MiB
  Total PE              511
  Free PE               0
  Allocated PE          511
  PV UUID               qissAX-4NwD-4MT2-6gX5-NLK2-Hn8W-obQhta
   
  --- Physical Segments ---
  Physical extent 0 to 510:
    Logical volume      /dev/group0/vol0
    Logical extents     0 to 510
   
  --- Physical volume ---
  PV Name               /dev/sdd
  VG Name               group0
  PV Size               2.00 GiB / not usable 4.00 MiB
  Allocatable           yes (but full)
  PE Size               4.00 MiB
  Total PE              511
  Free PE               0
  Allocated PE          511
  PV UUID               C7SPne-fqko-dxur-OhT0-7Kq6-Fxc5-CimMW9
   
  --- Physical Segments ---
  Physical extent 0 to 510:
    Logical volume      /dev/group0/vol0
    Logical extents     511 to 1021
   
  --- Physical volume ---
  PV Name               /dev/sdf
  VG Name               group0
  PV Size               2.00 GiB / not usable 4.00 MiB
  Allocatable           yes (but full)
  PE Size               4.00 MiB
  Total PE              511
  Free PE               0
  Allocated PE          511
  PV UUID               qOlNnq-dEFE-q2ov-ID6m-NDH8-9DPi-8jMn9j
   
  --- Physical Segments ---
  Physical extent 0 to 510:
    Logical volume      /dev/group0/vol1
    Logical extents     0 to 510
   
  "/dev/sde" is a new physical volume of "2.00 GiB"
  --- NEW Physical volume ---
  PV Name               /dev/sde
  VG Name               
  PV Size               2.00 GiB
  Allocatable           NO
  PE Size               0   
  Total PE              0
  Free PE               0
  Allocated PE          0
  PV UUID               XvIfXy-tarY-dxwz-l1SS-ZgeU-Moj5-2OBu2i

```

In the sections of the output labeled `Physical Segments`, you can see which numbered extents are associated with which logical volumes in the current configuration.

In this case:
- extent 0 through 510 (a total of 511 extents) on `/dev/sdc` are mapped to `/dev/group0/vol0`
- extent 0 through 510 on `/dev/sdd` are mapped to `/dev/group0/vol0`
- extent 0 through 510 on `/dev/sdf` are mapped to `/dev/group0/vol1`
- `/dev/sde` has no `Free PE`, `Total PE`, etc, because it is not currently a member of a volume group. It is marked as a `new` physical volume.

The `pvmove` command can be used to move all of the extents (and thus, the data) that reside on one physical volume to another physical volume within the same volume group. The target physical volume must have enough `Free PE` to contain the extents being migrated.

In the next exercise, we'll go through the process of migrating all of the extents associated with `/dev/group0/vol0` on `/dev/sdd` and placing them on `/dev/sde`. This can be performed while the filesystem is mounted!

# Exercise 4
- Add `/dev/sde` back to your volume group with `vgextend`
- Run `pvdisplay -m`, compare `/dev/sdd` to `/dev/sde` with respect to `Free PE`, `Total PE`
- run `pvmove /dev/sdd /dev/sde`
- While you wait, open another terminal session and see if you're still able to interact with the filesystem at `/mnt`
- Run `pvdisplay -m`, compare `/dev/sdd` to `/dev/sde` with respect to `Free PE`, `Total PE`
- Use `vgreduce` to remove `/dev/sdd`, which now has no PE associated with your volume group, from your volume group.

# Migrating volumes to smaller disks
Using all of the tools we've learned about in this lab, it's possible to migrate data from larger disks to smaller disks. The only requirement for all extents to evacuate a physical volume with `pvmove` is that the target physical volume has the same or more extents than the number of extents actually in use on the physical volume. If a logical volume is shrank, it will use fewer physical extents on the PVs it is mapped to #wording

The general process for migrating a logical volume to a smaller physical volume is this:

- shrink the filesystem (ideally a size smaller than your target size)
- shrink the logical volume to your target volume size (or just slightly smaller than the physical volume you are wanting to migrate to, but still larger than the filesystem)
- add a new physical volume to the volume group that is your target size or larger in extents
- use `pvmove` to move the extents from the larger physical volume to the smaller physical volume.
- verify no extents are mapped to the larger disk, remove it from the volume group with `vgreduce`. use `pvremove` to remove it from being tracked by `lvm` entirely if you plan on physically removing the underlying block device.
- use `lvresize` to grow the logical volume to any remainder extents (if you do your math right, this is only a handful)
- resize the filesystem that resides on top of the logical volume

# Exercise 5
At the end of Exercise 4, your volume group should be about 4GB in size:

```
/dev/mapper/group0-vol0  3.9G  8.0M  3.7G   1% /mnt
```

However, the filesystem is only using 8.0M. In this exercise, we are going to drastically reduce the size of this filesystem and its logical volume to around 100M.

Start by creating a 100M file to use as a block device, and set it up as a loopback device:

```
# dd if=/dev/zero of=/physical-volume.raw bs=1M count=100
100+0 records in
100+0 records out
104857600 bytes (105 MB, 100 MiB) copied, 0.0841903 s, 1.2 GB/s
# ls -Alh /physical-volume.raw 
-rw-r--r-- 1 root root 100M Dec 12 02:45 /physical-volume.raw
# losetup /dev/loop0 /physical-volume.raw
```

Add the loopback device `/dev/loop0` as a physical volume:

```
# pvcreate /dev/loop0
  Physical volume "/dev/loop0" successfully created
```

Now step through this process. Remember, our extent size is `4M`, and we want to avoid colliding boundaries between physical block device size, logical volume size, and filesystem size

- Add `/dev/loop0` to your volume group with `vgextend`
- shrink the filesystem on your logical volume to `90M`
- shrink the logical volume to `96M`
- check physical volume mappings with `pvdisplay -m`
- use `pvmove` to migrate the extents associated with your logical volume to the smaller disk
- check physical volume mappings with `pvdisplay -m`
- use `vgreduce` to remove both of the larger disk from the volume group
- use `pvremove` to remove both of the larger disks from `lvm`
- grow the logical volume to allocate any remaining extents
- grow the filesystem to allocate any remaining space in the logical volume
- check the output of `df -h /mnt`
- `touch /mnt/old-data` (this file will be used in the next exercise)

# Renaming logical volumes, working around disk cloning issues
When working in virtualized environments, it's sometimes necessary to restore a block device from a backup service. When this happens, its very easy to get into a state where multiple block devices are identifying as the same physical volume, as a member of the same volume group, and own data for the same logical volume:

```
# pvs
  Found duplicate PV OnHFLxk8uiQaL9XiWH1rY4IjUuDVRV0S: using /dev/loop1 not /dev/loop0
  Using duplicate PV /dev/loop1 without holders, replacing /dev/loop0
  PV         VG     Fmt  Attr PSize  PFree
  /dev/loop1 group0 lvm2 a--  96.00m    0 
  /dev/sdf   group0 lvm2 a--   2.00g    0 
```

In this case, I've created a duplicate of the loopback file we set up in Exercise 5 at `/dev/loop0`. When `lvm` detects this condition, it will bring up one of the physical volumes and deactivate the other.

To demonstrate this, if the logical volume is mounted, the file we created at the end of Exercise 5 is no longer present:

```
# ls /mnt/
lost+found
```

`lvm` retains backups of its configuration in `/etc/lvm`:

```
#/etc/lvm/backup/group0
# Generated by LVM2 version 2.02.133(2) (2015-10-30): Tue Dec 12 03:01:52 2017

contents = "Text Format Volume Group"
version = 1

description = "Created *after* executing 'vgreduce group0 /dev/sde'"

creation_host = "shell-lab101"  # Linux shell-lab101 4.4.0-98-generic #121-Ubuntu SMP Tue Oct 10 14:24:03 UTC 2017 x86_64
creation_time = 1513047712      # Tue Dec 12 03:01:52 2017

group0 {
        id = "0QCOWT-GgWX-a6vq-tnFE-mmjY-ok0A-KVpUHl"
        seqno = 22
        format = "lvm2"                 # informational
        status = ["RESIZEABLE", "READ", "WRITE"]
        flags = []
        extent_size = 8192              # 4 Megabytes
        max_lv = 0
        max_pv = 0
        metadata_copies = 0

        physical_volumes {

                pv0 {
                        id = "qOlNnq-dEFE-q2ov-ID6m-NDH8-9DPi-8jMn9j"
                        device = "/dev/sdf"     # Hint only

                        status = ["ALLOCATABLE"]
                        flags = []
                        dev_size = 4194304      # 2 Gigabytes
                        pe_start = 2048
                        pe_count = 511  # 1.99609 Gigabytes
                }

                pv1 {
                        id = "OnHFLx-k8ui-QaL9-XiWH-1rY4-IjUu-DVRV0S"
                        device = "/dev/loop0"   # Hint only

                        status = ["ALLOCATABLE"]
                        flags = []
                        dev_size = 204800       # 100 Megabytes
                        pe_start = 2048
                        pe_count = 24   # 96 Megabytes
                }
        }

        logical_volumes {

                vol0 {
                        id = "m3qxrH-mRH8-WRJC-BTEx-XcHp-GB1f-ufrdTY"
                        status = ["READ", "WRITE", "VISIBLE"]
                        flags = []
                        creation_host = "shell-lab101"
                        creation_time = 1513043971      # 2017-12-12 01:59:31 +0000
                        segment_count = 1

                        segment1 {
                                start_extent = 0
                                extent_count = 24       # 96 Megabytes

                                type = "striped"
                                stripe_count = 1        # linear

                                stripes = [
                                        "pv1", 0
                                ]
                        }
                }

                vol1 {
                        id = "XGrWAS-oXMi-WeZt-Jg7O-Rj0c-9HXO-zAJLYY"
                        status = ["READ", "WRITE", "VISIBLE"]
                        flags = []
                        creation_host = "shell-lab101"
                        creation_time = 1513044212      # 2017-12-12 02:03:32 +0000
                        segment_count = 1

                        segment1 {
                                start_extent = 0
                                extent_count = 511      # 1.99609 Gigabytes

                                type = "striped"
                                stripe_count = 1        # linear

                                stripes = [
                                        "pv0", 0
                                ]
                        }
                }
        }
}
```

In the next exercise, we'll use this file to
- give the cloned disk a new `physical volume` UUID
- rename the `volume group` the cloned disk is associated with (as well as provide it with a new UUID)
- rename the `logical volume` that is associated with the physical extents on the cloned disk (as well as provide it with a new UUID)

# Exercise 6
In order to run through this exercise, we'll need to create a cloned disk.

Ensure that your logical volume is not mounted to `/mnt` before starting this process, and give it a good `fsck` for good measure.

Stop the `lvm` service on the machine:

    service lvm2-lvmetad stop

Create a copy of the loopback device file that was created in the last exercise, and set it up as a loopback device at `/dev/loop1`

```
# cp physical-volume.raw physical-volume.cloned
# losetup /dev/loop1 /physical-volume.cloned
```

Start up the `lvm` service again:

    service lvm2-lvmetad start

run `pvs`, you should see an error similar to the following:

```
# pvs
  Found duplicate PV OnHFLxk8uiQaL9XiWH1rY4IjUuDVRV0S: using /dev/loop1 not /dev/loop0
  Using duplicate PV /dev/loop1 without holders, replacing /dev/loop0
  PV         VG     Fmt  Attr PSize  PFree
  /dev/loop1 group0 lvm2 a--  96.00m    0 
  /dev/sdf   group0 lvm2 a--   2.00g    0 
```

When we're done:

- we want `/dev/loop0` to hold the information for our current state at `/dev/group0/vol0`
- we want `/dev/loop1` to hold the information for our cloned (old) state at `/dev/group0-restore/vol0`

Make a copy of `/etc/lvm/backup/group0` in `root`'s HOME folder:

```
# cp /etc/lvm/backup/group0 ~/group0-restore
```

Open `group0-restore` in a text editor. In it, you'll see a JSON representation of the volume group, including all associated physical volumes, volume groups, and logical volumes.

Make the following modifications to the file with a text editor:
- Remove any `pv` associated with a disk that is not `/dev/loop0`
- Ensure the last remaining `pv` entry for `/dev/loop0` is titled `pv0`
- Change the device in `pv0` to `/dev/loop1`
- Remove any logical volume entries outside the scope of the disk we cloned
- Ensure the `stripes` entry in the remaining logical volume references `pv0`
- Change the `group`, `pv`, and `vol` UUIDs to something different. I generally just set the last 6 digits to a 0
- Change the name of `group0` to `group0-restore`

When you're finished, `group0-restore` should look something like this:

```
# Generated by LVM2 version 2.02.133(2) (2015-10-30): Tue Dec 12 03:01:52 2017

contents = "Text Format Volume Group"
version = 1

description = "Created *after* executing 'vgreduce group0 /dev/sde'"

creation_host = "shell-lab101"  # Linux shell-lab101 4.4.0-98-generic #121-Ubuntu SMP Tue Oct 10 14:24:03 UTC 2017 x86_64
creation_time = 1513047712      # Tue Dec 12 03:01:52 2017

group0-restore {
        id = "0QCOWT-GgWX-a6vq-tnFE-mmjY-ok0A-000000"
        seqno = 22
        format = "lvm2"                 # informational
        status = ["RESIZEABLE", "READ", "WRITE"]
        flags = []
        extent_size = 8192              # 4 Megabytes
        max_lv = 0
        max_pv = 0
        metadata_copies = 0

        physical_volumes {
                
                pv0 {   
                        id = "OnHFLx-k8ui-QaL9-XiWH-1rY4-IjUu-000000"
                        device = "/dev/loop1"   # Hint only
                        
                        status = ["ALLOCATABLE"]
                        flags = [] 
                        dev_size = 204800       # 100 Megabytes
                        pe_start = 2048 
                        pe_count = 24   # 96 Megabytes
                }
        }

        logical_volumes {
                
                vol0 {  
                        id = "m3qxrH-mRH8-WRJC-BTEx-XcHp-GB1f-000000"
                        status = ["READ", "WRITE", "VISIBLE"]
                        flags = []
                        creation_host = "shell-lab101"  
                        creation_time = 1513043971      # 2017-12-12 01:59:31 +0000
                        segment_count = 1

                        segment1 {
                                start_extent = 0
                                extent_count = 24       # 96 Megabytes

                                type = "striped"
                                stripe_count = 1        # linear

                                stripes = [
                                        "pv0", 0
                                ]
                        }
                }

        }
}
```

Before we can fix `/dev/loop1`, its volume group needs to be taken offline so that `lvm` doesn't attempt to use it. Ensure the logical volume is unmounted and run `vgchange -a n group0`

Grab the PV UUID that was written to `group0-restore`, and use it to restore the volume group from `/dev/loop1`:

```
pvcreate -ff --uuid OnHFLx-k8ui-QaL9-XiWH-1rY4-IjUu-000000 --restorefile group0-restore /dev/loop1
  Couldn't find device with uuid OnHFLx-k8ui-QaL9-XiWH-1rY4-IjUu-000000.
Really INITIALIZE physical volume "/dev/loop1" of volume group "group0" [y/n]? y
  WARNING: Forcing physical volume creation on /dev/loop1 of volume group "group0"
  Physical volume "/dev/loop1" successfully created
```

Run `pvs`. You'll see `/dev/loop0` now shows itself as a member of `group`, and `/dev/loop1` is not associated with any volume group.

Now restore the volume group from `group0-restore`:

```
# vgcfgrestore -f group0-restore group0-restore
```

Run `pvs` again. You'll see both disks are mapped to their own volume groups.
Run `vgchange -a y` to reactivate all logical volumes detected by `lvm`

Mount `/dev/group0-restore/vol0` somewhere. You should see the `old-data` file that was created at the end of the last exercise.


#TODO

Some places need work on wording, but the exercises should work

# Trivia

# Further reading
- Read the `man` pages associated with each command. Find different parameters to try with each command in the exercises.


