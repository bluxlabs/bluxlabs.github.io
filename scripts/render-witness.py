# Render the existing Witness assembly without editing its geometry or source file.
import bpy,sys,json,hashlib,math
from pathlib import Path
from mathutils import Vector
args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
preview='--preview' in args
out=Path(args[args.index('--output')+1] if '--output' in args else 'witness-renders').resolve();out.mkdir(parents=True,exist_ok=True)
scene=bpy.context.scene
source=Path(bpy.data.filepath)
source_hash=hashlib.sha256(source.read_bytes()).hexdigest()
meshes=[o for o in scene.objects if o.type=='MESH']
original_vertices=sum(len(o.data.vertices) for o in meshes)
def collection(name):
 c=bpy.data.collections.new(name);scene.collection.children.link(c);return c
cams=collection('COL_WebCameras');lights=collection('COL_WebLights');stage=collection('COL_WebStage')
for o in list(scene.objects):
 if o.type in {'LIGHT','CAMERA'}:o.hide_render=True

def mat(name,color,metal=0,rough=.4,transmission=0):
 m=bpy.data.materials.new(name);m.use_nodes=True
 p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=rough;p.inputs['Transmission Weight'].default_value=transmission;p.inputs['IOR'].default_value=1.45
 return m
aluminum=mat('MAT_WebAluminum',(.48,.53,.59),.82,.25)
bracket=mat('MAT_WebBracket',(.20,.25,.31),.78,.28)
rubber=mat('MAT_WebCaster',(.025,.031,.039),.1,.42)
glass=mat('MAT_WebGlass',(.93,.98,1),0,.04,1)
floormat=mat('MAT_WebFloor',(.024,.043,.071),.15,.33)
for o in meshes:
 if 'ADA_Glass' in o.name:o.data.materials.clear();o.data.materials.append(glass)
 elif not o.data.materials:
  o.data.materials.append(rubber if 'Caster' in o.name else bracket if ('Bracket' in o.name or o.name.startswith('3136')) else aluminum)
# Existing mesh geometry, transforms and camera components are unchanged.
bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,.0));floor=bpy.context.object;floor.name='WEB_StudioFloor';floor.data.materials.append(floormat)
for c in list(floor.users_collection):c.objects.unlink(floor)
stage.objects.link(floor)
def aim(o,p):o.rotation_euler=(Vector(p)-o.location).to_track_quat('-Z','Y').to_euler()
def area(name,loc,power,size,color,target):
 data=bpy.data.lights.new(name,'AREA');data.energy=power;data.shape='DISK';data.size=size;data.color=color
 o=bpy.data.objects.new(name,data);lights.objects.link(o);o.location=loc;aim(o,target)
area('LGT_WebKey',(1,-3,4),300,3,(.83,.91,1),(0,0,1))
area('LGT_WebFill',(-3,-1,2.5),180,2.5,(.6,.78,1),(0,0,1))
area('LGT_WebRim',(1.5,2,3),400,2,(.3,.64,1),(0,0,1))
area('LGT_WebSoftbox',(-.5,0,4.5),160,2,(1,1,1),(0,0,.9))
world=bpy.data.worlds.new('WORLD_WebStudio');world.use_nodes=True;world.node_tree.nodes['Background'].inputs[0].default_value=(.06,.10,.17,1);world.node_tree.nodes['Background'].inputs[1].default_value=.5;scene.world=world
for m in bpy.data.materials:
 if m.name.startswith('mat_') and m.use_nodes:
  for node in m.node_tree.nodes:
   if node.type=='BSDF_PRINCIPLED':
    node.inputs['Metallic'].default_value=.25
    node.inputs['Roughness'].default_value=.32
scene.render.use_compositing=False;scene.render.use_sequencer=False
scene.render.engine='CYCLES';scene.cycles.samples=24 if preview else 128;scene.cycles.use_denoising=True;scene.cycles.max_bounces=10;scene.cycles.transparent_max_bounces=8
try:
 prefs=bpy.context.preferences.addons['cycles'].preferences;prefs.compute_device_type='OPTIX';prefs.get_devices()
 gpu=False
 for d in prefs.devices:d.use=(d.type!='CPU');gpu=gpu or d.use
 if gpu:scene.cycles.device='GPU'
except Exception:pass
scene.render.threads_mode='FIXED';scene.render.threads=12
scene.view_settings.view_transform='AgX';scene.view_settings.look='AgX - Medium High Contrast';scene.view_settings.exposure=0
scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGB';scene.render.resolution_percentage=100
scene.render.film_transparent=False
shots=[
 ('overview',(3,-4,2.85),(0,0,.95),2.55,(1400,1600)),
 ('frame',(1.15,-1.4,1.3),(.47,-.43,.91),.48,(1600,1100)),
 ('arena',(.65,-1.55,2.05),(0,0,1.02),1.25,(1600,1100)),
 ('sense',(0,-.85,1.30),(-.32,-.32,1.07),.34,(1600,1100)),
]
manifest={'source_file':source.name,'source_sha256':source_hash,'source_mesh_count':len(meshes),'source_vertices':original_vertices,'geometry_changed':False,'renderer':'Blender '+bpy.app.version_string+' / Cycles','shots':[]}
for name,loc,target,scale,size in shots:
 d=bpy.data.cameras.new('CAM_Web_'+name);d.type='ORTHO';d.ortho_scale=scale;d.lens=70;d.clip_start=.001;d.clip_end=200
 cam=bpy.data.objects.new('CAM_Web_'+name,d);cams.objects.link(cam);cam.location=loc;aim(cam,target);scene.camera=cam
 scene.render.resolution_x=size[0]//2 if preview else size[0];scene.render.resolution_y=size[1]//2 if preview else size[1]
 scene.render.filepath=str(out/(name+('-preview' if preview else '')+'.png'));bpy.ops.render.render(write_still=True)
 manifest['shots'].append({'name':name,'camera':list(loc),'target':list(target),'ortho_scale':scale,'resolution':[scene.render.resolution_x,scene.render.resolution_y]})
assert original_vertices==sum(len(o.data.vertices) for o in meshes)
assert hashlib.sha256(source.read_bytes()).hexdigest()==source_hash
(out/('preview-manifest.json' if preview else 'source-manifest.json')).write_text(json.dumps(manifest,indent=2))
if not preview:bpy.ops.wm.save_as_mainfile(filepath=str(out/'Witness_Web_Studio.blend'))
print('RENDERS_COMPLETE',str(out))
